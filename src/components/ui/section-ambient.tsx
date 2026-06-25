import { cn } from "@/lib/utils";

export type SectionAmbientTone = "white" | "cream" | "warm";

type SectionAmbientProps = {
  tone?: SectionAmbientTone;
  className?: string;
  blobs?: boolean;
};

export function SectionAmbient({
  tone = "cream",
  className,
  blobs = true,
}: SectionAmbientProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className={cn("absolute inset-0 section-ambient-base", `section-ambient-base--${tone}`)} />
      <div className="absolute inset-0 section-ambient-pattern" />
      {blobs ? (
        <>
          <div className="section-ambient-blob section-ambient-blob--primary" />
          <div className="section-ambient-blob section-ambient-blob--navy" />
          <div className="section-ambient-blob section-ambient-blob--gold" />
        </>
      ) : null}
      <div className="absolute inset-0 grain opacity-[0.35]" />
    </div>
  );
}
