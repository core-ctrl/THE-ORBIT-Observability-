import { SettingsSidebar } from "@/components/layout/SettingsSidebar";
import { GlobalFooter } from "@/components/layout/GlobalFooter";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="monochrome-shell min-h-screen bg-black text-white flex transition-colors duration-300 selection:bg-white selection:text-black">
      <SettingsSidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen bg-black">
        <main className="flex-1 p-6">
          {children}
        </main>
        <GlobalFooter />
      </div>
    </div>
  );
}
