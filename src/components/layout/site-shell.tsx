import { Header } from "./header";
import { Footer } from "./footer";

type SiteShellProps = {
  children: React.ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="canvas-ambient grain" aria-hidden />
      <Header />
      <main className="relative flex-1 pt-[5.75rem] md:pt-[6.25rem]">{children}</main>
      <Footer />
    </div>
  );
}
