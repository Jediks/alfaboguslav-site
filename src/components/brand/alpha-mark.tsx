import { cn } from "@/lib/utils";

type AlphaMarkProps = {
  className?: string;
  compact?: boolean;
  hat?: boolean;
};

const SERIF = "Georgia, 'Times New Roman', 'Palatino Linotype', serif";
const RED = "#C41E3A";

/** Upright α; tilted hat on top-right bowl */
const LAYOUT = {
  full: { ax: 18, ay: 27, size: 28, hatX: 5.5, hatY: -15, hatTilt: 22, hatScale: 0.5 },
  compact: { ax: 16, ay: 23, size: 24, hatX: 4.5, hatY: -13, hatTilt: 22, hatScale: 0.44 },
} as const;

export function AlphaMark({ className, compact, hat = true }: AlphaMarkProps) {
  const L = compact ? LAYOUT.compact : LAYOUT.full;
  const vb = compact ? "0 0 32 32" : "0 0 36 36";

  return (
    <svg
      viewBox={vb}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 overflow-visible", className)}
      role={compact ? "img" : undefined}
      aria-label={compact ? "Alpha Boguslav" : undefined}
      aria-hidden={compact ? undefined : true}
    >
      <g transform={`translate(${L.ax}, ${L.ay})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fontFamily={SERIF}
          fontSize={L.size}
          fill={RED}
        >
          α
        </text>
        {hat && (
          <g
            transform={`translate(${L.hatX}, ${L.hatY}) rotate(${L.hatTilt}) scale(${L.hatScale}) translate(-12.5, -8.5)`}
          >
            <SantaHat />
          </g>
        )}
      </g>
    </svg>
  );
}

/** Trim band anchor is y≈8.5 — group above translates so it rests on the α bowl */
function SantaHat() {
  return (
    <g>
      <path d="M10 8.5 14.5 2.5 19 8.5Z" fill={RED} />
      <rect x="8" y="8.5" width="13" height="3.2" rx="1.5" fill="#fff" />
      <circle cx="19.5" cy="3.5" r="2" fill="#fff" />
    </g>
  );
}
