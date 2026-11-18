import type { Metadata } from "next";
import type { ReactNode } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { GeistSans } from "geist/font/sans";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Orbit | SaaS Application Monitoring",
  description: "Monitor everything. Fix it before it breaks."
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" className={GeistSans.className}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* ── Universal Scrollbar Elimination ── */
              html, body, *, *::before, *::after {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              ::-webkit-scrollbar,
              *::-webkit-scrollbar,
              html::-webkit-scrollbar,
              body::-webkit-scrollbar,
              textarea::-webkit-scrollbar,
              div::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
                background: transparent !important;
                opacity: 0 !important;
              }
              ::-webkit-scrollbar-button,
              *::-webkit-scrollbar-button,
              textarea::-webkit-scrollbar-button {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
              }
              ::-webkit-scrollbar-track,
              *::-webkit-scrollbar-track,
              ::-webkit-scrollbar-thumb,
              *::-webkit-scrollbar-thumb,
              ::-webkit-scrollbar-corner,
              *::-webkit-scrollbar-corner,
              ::-webkit-resizer,
              *::-webkit-resizer {
                display: none !important;
                background: transparent !important;
              }
            `,
          }}
        />
      </head>
      <body className="bg-primary text-primary antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
