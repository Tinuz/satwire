import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

/**
 * Main app shell wrapping all authenticated pages.
 * Provides sticky header + bottom nav (mobile) + main content area.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col grid-bg">
      {/* Radial green spotlight – top center */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(0,255,85,0.055),transparent)] z-0" />
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-4 md:px-6 md:pb-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
