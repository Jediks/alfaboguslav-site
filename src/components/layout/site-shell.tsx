import { Header } from "./header";
import { Footer } from "./footer";

import { SkipToContent } from "./skip-to-content";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SkipToContent />
      <div className="canvas-ambient grain" aria-hidden />
      <Header />
      <main id="main-content" className="relative flex-1 pt-[5.75rem] md:pt-[6.25rem]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
