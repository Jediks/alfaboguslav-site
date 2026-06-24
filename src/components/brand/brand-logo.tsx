import { AlphaMark } from "@/components/brand/alpha-mark";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "mark" | "header" | "footer";
  className?: string;
};

export function BrandLogo({ variant = "header", className }: BrandLogoProps) {
  const markClass =
    variant === "footer"
      ? "h-[3.25rem] w-[3.25rem]"
      : variant === "header"
        ? "h-9 w-9 md:h-10 md:w-10"
        : "h-10 w-10";

  if (variant === "footer") {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        <AlphaMark hat className={markClass} />
        <div className="leading-none">
          <p className="font-display text-lg font-bold uppercase tracking-[0.08em] text-white">
            Альфа
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
            Богуслав
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 md:gap-3.5", className)}>
      <AlphaMark hat className={markClass} />
      <div className="hidden leading-none sm:block">
        <p className="font-display text-sm font-bold uppercase tracking-[0.08em] text-inherit md:text-[15px]">
          Альфа
        </p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.24em] text-inherit/70">
          Богуслав
        </p>
      </div>
    </div>
  );
}
