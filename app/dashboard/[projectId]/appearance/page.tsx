"use client";

import { useState, useEffect, use } from "react";
import { Check, Monitor, Moon, Sun, MonitorSmartphone, Eye, Sliders, Palette, LayoutGrid } from "lucide-react";
import { useTheme } from "@/components/ui/theme-toggle";

export default function AppearancePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Customization states
  const [monochromePreset, setMonochromePreset] = useState("pure-obsidian");
  const [density, setDensity] = useState("comfortable");
  const [contrastRatio, setContrastRatio] = useState("maximum");
  
  useEffect(() => {
    setMounted(true);
    const savedPreset = localStorage.getItem('orbit-monochrome-preset');
    if (savedPreset) setMonochromePreset(savedPreset);
    
    const savedDensity = localStorage.getItem('orbit-density');
    if (savedDensity) setDensity(savedDensity);
  }, []);

  const handlePresetChange = (preset: string) => {
    setMonochromePreset(preset);
    localStorage.setItem('orbit-monochrome-preset', preset);
  };
  
  const handleDensityChange = (d: string) => {
    setDensity(d);
    localStorage.setItem('orbit-density', d);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-5xl text-white animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            Display Preferences & Shell Typography
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-black shadow-sm">
                <Palette className="h-4 w-4" />
              </span>
              Appearance
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/15 bg-white/5 text-zinc-300">
              HIGH CONTRAST MONOCHROME
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Obsidian Theme Presets */}
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monochrome Contrast System</h2>
              <p className="text-xs text-zinc-400 mt-1">Select the neutral contrast shade for telemetry borders and active cards.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "pure-obsidian", name: "Pure Obsidian", desc: "#000000 True Pitch Black", bg: "bg-black" },
                { id: "deep-zinc", name: "Deep Zinc", desc: "#09090b Neutral Obsidian", bg: "bg-zinc-950" },
                { id: "graphite", name: "Graphite Slate", desc: "#18181b Muted Graphite", bg: "bg-zinc-900" },
                { id: "high-contrast", name: "High Contrast", desc: "#FFFFFF Razor White Borders", bg: "bg-black border-2 border-white" },
              ].map((preset) => {
                const isSelected = monochromePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      isSelected
                        ? "border-white bg-white/[0.08] shadow-md"
                        : "border-white/10 bg-black hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-4 h-4 rounded-full ${preset.bg} border border-white/30`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="text-xs font-semibold text-white">{preset.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Layout Density */}
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Grid & Table Density</h2>
              <p className="text-xs text-zinc-400 mt-1">Control padding across telemetry tables, log terminals, and event streams.</p>
            </div>

            <div className="space-y-2.5">
              {[
                { id: "compact", label: "Compact Density", desc: "Maximum rows per viewport &bull; Optimal for high-throughput stream inspection" },
                { id: "comfortable", label: "Comfortable (Standard)", desc: "Balanced visual hierarchy &bull; Default production telemetry spacing" },
                { id: "spacious", label: "Spacious Studio", desc: "Relaxed paddings and oversized metric displays" },
              ].map((d) => {
                const isSelected = density === d.id;
                return (
                  <label
                    key={d.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "border-white bg-white/[0.06]"
                        : "border-white/10 bg-black hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="density"
                      checked={isSelected}
                      onChange={() => handleDensityChange(d.id)}
                      className="mt-1 text-white focus:ring-0 bg-black border-white/30"
                    />
                    <div>
                      <div className="font-semibold text-xs text-white">{d.label}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 font-mono" dangerouslySetInnerHTML={{ __html: d.desc }} />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Live Preview */}
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Live Shell Preview</h2>
            <div
              className="border border-white/10 rounded-xl bg-black space-y-4"
              style={{ padding: density === 'compact' ? '1rem' : density === 'spacious' ? '2rem' : '1.5rem' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center text-xs font-bold font-mono">
                    O
                  </div>
                  <span className="font-semibold text-white text-xs">Orbit Dashboard</span>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-white text-black font-semibold shadow-sm hover:bg-zinc-200 transition">
                  Deploy
                </button>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="h-16 rounded-xl border border-white/10 bg-zinc-950 p-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="w-24 h-3 bg-zinc-700 rounded" />
                    <div className="w-16 h-2 bg-zinc-800 rounded" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
                
                <div className="h-16 rounded-xl border border-white/10 bg-zinc-950 p-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="w-32 h-3 bg-zinc-700 rounded" />
                    <div className="w-20 h-2 bg-zinc-800 rounded" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
