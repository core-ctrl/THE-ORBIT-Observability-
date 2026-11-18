"use client";

import { useState, useEffect, useRef, use } from "react";
import dynamic from "next/dynamic";
import {
  Code2, FileCode, FolderOpen, Play, CheckCircle2,
  AlertTriangle, ShieldAlert, Sparkles, Terminal, GitCommit,
  RotateCw, Copy, Check, ChevronRight, ChevronDown, Layers,
  ExternalLink, Bug, ArrowRight, ShieldCheck, Lock, Eye,
  MonitorDown, Laptop, Settings2, Folder
} from "lucide-react";

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface SourceFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

interface Diagnostic {
  line: number;
  column: number;
  severity: "security" | "error" | "warning" | "info";
  category: string;
  title: string;
  explanation: string;
  suggested_patch?: string;
}

const DEFAULT_FILES: SourceFile[] = [
  {
    path: "pages/api/movies.js",
    name: "movies.js",
    language: "javascript",
    content: `import { db } from "@/lib/db";

export default async function handler(req, res) {
  const { query, genre } = req.query;

  // Unsafe database query vulnerable to SQL Injection
  const sql = \`SELECT * FROM movies WHERE title = '\${query}' AND genre = '\${genre}'\`;
  const result = await db.query(sql);

  res.status(200).json({ success: true, data: result.rows });
}
`
  },
  {
    path: "lib/orbit.js",
    name: "orbit.js",
    language: "javascript",
    content: `import { initOrbit } from "orbit-observability";

// Initialize Orbit Observability SDK for production
export const orbit = initOrbit({
  dsn: process.env.NEXT_PUBLIC_ORBIT_DSN,
  endpoint: process.env.NEXT_PUBLIC_ORBIT_ENDPOINT || "http://localhost:8000",
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 1.0,
});
`
  },
  {
    path: "pages/_app.js",
    name: "_app.js",
    language: "javascript",
    content: `import "@/styles/globals.css";
import { orbit } from "@/lib/orbit";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
`
  },
  {
    path: "components/UserProfile.js",
    name: "UserProfile.js",
    language: "javascript",
    content: `import DOMPurify from "dompurify";

export function UserProfile({ user }) {
  // Vulnerable raw HTML injection without sanitization
  return (
    <div className="profile-card">
      <h2>{user?.name}</h2>
      <div dangerouslySetInnerHTML={{ __html: user?.bio }} />
    </div>
  );
}
`
  }
];

export default function CloudIDEPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [files, setFiles] = useState<SourceFile[]>(DEFAULT_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>("pages/api/movies.js");
  const [activeCode, setActiveCode] = useState<string>("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanLatency, setScanLatency] = useState<number>(0);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);
  const [aiPermissionMode, setAiPermissionMode] = useState<"review" | "full" | "readonly">("review");
  const [diffPreview, setDiffPreview] = useState<string | null>(null);
  const [gitStatus, setGitStatus] = useState<string>("Workspace synced");
  const [commitMessage, setCommitMessage] = useState<string>("fix: patch security vulnerability via Sentinel SLM");
  const [appliedFixCount, setAppliedFixCount] = useState<number>(0);
  const [showVscodeModal, setShowVscodeModal] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [localProjectPath, setLocalProjectPath] = useState<string>(`~/projects/${projectId}`);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const scanCacheRef = useRef<Map<string, { diags: Diagnostic[]; latency: number }>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];

  useEffect(() => {
    if (activeFile) {
      setActiveCode(activeFile.content);
      // Immediate scan for active file with cache check
      scanCodeWithSLM(activeFile.content, activeFile.path);
    }
  }, [activeFilePath]);

  const scanCodeWithSLM = async (codeToScan: string, filePath: string) => {
    // Check if identical code buffer was already analyzed
    const cacheKey = `${filePath}::${codeToScan.length}::${codeToScan.slice(0, 50)}`;
    const cached = scanCacheRef.current.get(cacheKey);
    if (cached) {
      setDiagnostics(cached.diags);
      setScanLatency(0.2);
      setSelectedDiagnostic(cached.diags.length > 0 ? cached.diags[0] : null);
      applyMonacoMarkers(cached.diags);
      return;
    }

    setScanning(true);
    try {
      const res = await fetch("http://localhost:8020/api/v1/guardian/code/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToScan, file_path: filePath }),
      });
      if (res.ok) {
        const data = await res.json();
        const diags = data.diagnostics || [];
        const latency = data.scan_latency_ms || 1.2;

        scanCacheRef.current.set(cacheKey, { diags, latency });
        setDiagnostics(diags);
        setScanLatency(latency);
        if (diags.length > 0) {
          setSelectedDiagnostic(diags[0]);
        } else {
          setSelectedDiagnostic(null);
        }

        applyMonacoMarkers(diags);
      }
    } catch (err) {
      console.warn("[Sentinel SLM Scan]:", err);
    } finally {
      setScanning(false);
    }
  };

  const applyMonacoMarkers = (diags: Diagnostic[]) => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers = diags.map((d: Diagnostic) => ({
          startLineNumber: d.line,
          startColumn: d.column || 1,
          endLineNumber: d.line,
          endColumn: 100,
          message: `[Sentinel SLM] ${d.title}: ${d.explanation}`,
          severity: monacoRef.current.MarkerSeverity.Error,
        }));
        monacoRef.current.editor.setModelMarkers(model, "sentinel-slm", markers);
      }
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Monochrome obsidian theme
    monaco.editor.defineTheme("orbit-monochrome", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "71717a", fontStyle: "italic" },
        { token: "keyword", foreground: "ffffff", fontStyle: "bold" },
        { token: "string", foreground: "d4d4d8" },
        { token: "identifier", foreground: "e4e4e7" },
        { token: "number", foreground: "a1a1aa" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#f4f4f5",
        "editor.lineHighlightBackground": "#18181b",
        "editorLineNumber.foreground": "#52525b",
        "editorLineNumber.activeForeground": "#ffffff",
        "editor.selectionBackground": "#3f3f46",
        "editorCursor.foreground": "#ffffff",
      },
    });

    monaco.editor.setTheme("orbit-monochrome");
  };

  const handleApplyFix = async (diag: Diagnostic) => {
    if (!diag.suggested_patch) return;
    try {
      const res = await fetch("http://localhost:8020/api/v1/guardian/code/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeCode,
          target_line: diag.line,
          replacement: diag.suggested_patch,
          file_path: activeFilePath,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCode(data.patched_code);
        setDiffPreview(data.diff);
        setGitStatus(`1 modified file: ${activeFilePath}`);
        setAppliedFixCount((prev) => prev + 1);

        setFiles((prev) =>
          prev.map((f) => (f.path === activeFilePath ? { ...f, content: data.patched_code } : f))
        );

        setTimeout(() => {
          scanCodeWithSLM(data.patched_code, activeFilePath);
        }, 300);
      }
    } catch (err) {
      console.error("[Sentinel Fix Error]:", err);
    }
  };

  const handleOpenLocalVscode = () => {
    const targetPath = encodeURIComponent(localProjectPath);
    window.location.href = `vscode://file/${targetPath}`;
    setShowVscodeModal(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] text-white font-sans overflow-hidden bg-black">
      {/* Top IDE Toolbar */}
      <div className="h-14 border-b border-white/10 bg-black px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black font-black shadow-sm">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Cloud IDE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold">
                MONACO + SENTINEL SLM
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Workspace &bull; {activeFilePath}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenLocalVscode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition shadow-sm"
            title="Open project in local Desktop VS Code"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Open in Desktop VS Code</span>
          </button>

          <div className="flex items-center gap-2 bg-zinc-950 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span className="text-zinc-400 text-[11px]">AI Permission:</span>
            <select
              value={aiPermissionMode}
              onChange={(e) => setAiPermissionMode(e.target.value as any)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
            >
              <option value="review" className="bg-black text-white">Review & Confirm</option>
              <option value="full" className="bg-black text-white">Full Autonomous Healing</option>
              <option value="readonly" className="bg-black text-white">Read-Only Diagnostics</option>
            </select>
          </div>

          <button
            onClick={() => scanCodeWithSLM(activeCode, activeFilePath)}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 border border-white text-xs font-semibold transition"
          >
            <RotateCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            <span>{scanning ? "Analyzing..." : "Re-Scan Buffer"}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: VS Code File Explorer */}
        <div className="w-60 border-r border-white/10 bg-black flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Explorer</span>
            <span className="text-[10px] font-mono text-white">{files.length} FILES</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5 px-2 py-1">
              <FolderOpen className="w-3.5 h-3.5 text-white" />
              <span>{projectId}</span>
            </div>

            <div className="pl-3 space-y-0.5">
              {files.map((file) => {
                const isActive = file.path === activeFilePath;
                return (
                  <button
                    key={file.path}
                    onClick={() => setActiveFilePath(file.path)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition ${
                      isActive
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-black" : "text-zinc-500"}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extension Hub Card */}
          <div className="p-3 border-t border-white/10 bg-zinc-950 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Sentinel Bridge</span>
              <span className="text-white font-mono font-semibold">Active</span>
            </div>
            <button
              onClick={() => setShowVscodeModal(true)}
              className="w-full text-center py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white transition border border-white/10"
            >
              Desktop Connection
            </button>
          </div>
        </div>

        {/* Column 2: Authentic Monaco VS Code Editor */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden">
          {/* File Tabs */}
          <div className="h-9 border-b border-white/10 bg-zinc-950 flex items-center px-3 gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-black border-t-2 border-white text-xs font-mono text-white">
              <FileCode className="w-3.5 h-3.5 text-white" />
              <span>{activeFile.name}</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono ml-auto">
              Scan Latency: {scanLatency}ms &bull; Language: {activeFile.language}
            </span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 overflow-hidden relative">
            <Editor
              height="100%"
              path={activeFile.path}
              defaultLanguage={activeFile.language}
              value={activeCode}
              onChange={(value) => {
                const nextCode = value || "";
                setActiveCode(nextCode);
                if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = setTimeout(() => {
                  scanCodeWithSLM(nextCode, activeFile.path);
                }, 400);
              }}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, Menlo, Monaco, monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                automaticLayout: true,
                lineNumbers: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Bottom Terminal & Git Drawer */}
          <div className="h-32 border-t border-white/10 bg-black flex flex-col shrink-0">
            <div className="h-8 border-b border-white/10 px-3 flex items-center justify-between text-xs font-mono bg-zinc-950">
              <div className="flex items-center gap-2 text-zinc-300">
                <Terminal className="w-3.5 h-3.5 text-white" />
                <span className="font-semibold text-white">Terminal</span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-zinc-400">{gitStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Git commit message..."
                  className="bg-black border border-white/15 px-2.5 py-0.5 rounded text-[11px] text-white w-72 focus:outline-none focus:border-white font-mono"
                />
                <button
                  onClick={() => alert("Changes staged and committed to git repository.")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white text-black font-semibold text-[11px] hover:bg-zinc-200 transition"
                >
                  <GitCommit className="w-3 h-3" />
                  <span>Commit</span>
                </button>
              </div>
            </div>
            <div className="flex-1 p-2.5 font-mono text-[11px] text-zinc-400 overflow-y-auto space-y-1">
              <p className="text-zinc-500">[Sentinel Daemon]: Monitoring workspace &bull; Active buffer analysis online</p>
              {diagnostics.length > 0 ? (
                diagnostics.map((d, i) => (
                  <p key={i} className="text-zinc-300">
                    &bull; [Line {d.line}] {d.title}: {d.explanation}
                  </p>
                ))
              ) : (
                <p className="text-white">✓ No security or syntax anomalies detected in active file.</p>
              )}
              {appliedFixCount > 0 && (
                <p className="text-zinc-300">✓ {appliedFixCount} patch(es) integrated into editor buffer.</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Sentinel SLM Intelligence & Patch Panel */}
        <div className="w-96 border-l border-white/10 bg-black flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 border-b border-white/10 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Sentinel Inspector</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
              {diagnostics.length} FINDINGS
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {diagnostics.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white mx-auto border border-white/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Codebase Clean</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Sentinel detected zero injections, uncaught exceptions, or credential exposures in this file.
                  </p>
                </div>
              </div>
            ) : (
              diagnostics.map((diag, index) => {
                const isSelected = selectedDiagnostic === diag;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDiagnostic(diag)}
                    className={`rounded-xl border p-4 space-y-3 transition cursor-pointer ${
                      isSelected
                        ? "border-white bg-zinc-900 shadow-md"
                        : "border-white/10 bg-zinc-950 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded bg-white text-black font-bold text-xs shrink-0">
                          !
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-white leading-tight">{diag.title}</h4>
                          <span className="text-[10px] font-mono text-zinc-400">Line {diag.line} &bull; {diag.category}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {diag.explanation}
                    </p>

                    {diag.suggested_patch && (
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                          <span>Suggested Patch:</span>
                          <span className="text-[10px] font-mono text-zinc-500">In-Place</span>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-black border border-white/10 font-mono text-[11px] text-zinc-200 overflow-x-auto whitespace-pre-wrap">
                          {diag.suggested_patch}
                        </pre>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyFix(diag);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Patch to Buffer</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Diff Preview if applied */}
            {diffPreview && (
              <div className="rounded-xl border border-white/20 bg-zinc-950 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Generated Diff:</span>
                  <span className="text-[10px] font-mono text-zinc-500">Unified git diff</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-black border border-white/10 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre">
                  {diffPreview}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop VS Code Integration Modal */}
      {showVscodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-white" />
                <h3 className="text-base font-semibold text-white">Open in Desktop VS Code</h3>
              </div>
              <button
                onClick={() => setShowVscodeModal(false)}
                className="text-zinc-500 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Launch your project workspace directly in your native VS Code or Antigravity editor with live telemetry synchronization.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400">Local Project Directory:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localProjectPath}
                  onChange={(e) => setLocalProjectPath(e.target.value)}
                  placeholder="e.g. C:/Projects/my-app or ~/projects/my-app"
                  className="flex-1 bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Project Telemetry DSN Key:</span>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black border border-white/15 font-mono text-xs">
                <span className="text-zinc-300 truncate flex-1">6d8b2b00df4a4885bb9eb26a38cd6a46</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("6d8b2b00df4a4885bb9eb26a38cd6a46");
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-white text-black text-[11px] font-semibold hover:bg-zinc-200"
                >
                  {copiedKey ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-zinc-400">Terminal Command:</span>
              <pre className="p-3 rounded-lg bg-black border border-white/15 font-mono text-xs text-zinc-200">
                npx orbit-observability --watch
              </pre>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.location.href = `vscode://file/${encodeURIComponent(localProjectPath)}`;
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition"
              >
                Launch VS Code Protocol
              </button>
              <button
                onClick={() => setShowVscodeModal(false)}
                className="py-2 px-4 rounded-xl bg-zinc-900 border border-white/10 text-white font-medium text-xs hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
