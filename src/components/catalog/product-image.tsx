import Image from "next/image";
import { cn } from "@/lib/utils";

export type ProductImageVariant = "card" | "dark" | "minimal";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  variant?: ProductImageVariant;
  /** Tighter padding = larger product on screen */
  size?: "default" | "large" | "xl" | "fill";
  className?: string;
  imageClassName?: string;
};

/**
 * Floating product — transparent PNG cutout + CSS shadow.
 * No cream/white box; spotlight glow only.
 */
export function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
  variant = "card",
  size = "default",
  className,
  imageClassName,
}: ProductImageProps) {
  const padding =
    size === "fill"
      ? "p-0 scale-[1.28] md:scale-[1.38]"
      : size === "xl"
        ? "p-0 scale-[1.12] md:scale-[1.18]"
        : size === "large"
          ? className?.includes("showcase-product")
            ? "p-[2%] md:p-[3%] scale-[1.08]"
            : "p-[2%] md:p-[3%]"
          : variant === "dark"
            ? "p-[3%] md:p-[4%]"
            : "p-[3%] md:p-[4%]";

  const isShowcase = className?.includes("showcase-product");

  return (
    <div
      className={cn(
        "product-stage relative flex h-full w-full items-center justify-center",
        !isShowcase && "overflow-hidden",
        variant === "card" && "product-stage-card",
        variant === "dark" && "product-stage-dark",
        variant === "minimal" && "product-stage-minimal",
        className
      )}
    >
      <div className="product-spotlight" aria-hidden />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("product-float object-contain", padding, imageClassName)}
      />
    </div>
  );
}

/** Prefer transparent cutout; falls back to JPEG path. */
export function productImageSrc(jpegPath: string): string {
  const v = jpegPath.includes("?") ? jpegPath.split("?")[1] : "";
  const q = v ? `?${v}` : "";

  if (jpegPath.includes("/sets/") && jpegPath.includes("-packaging")) {
    const slug = jpegPath.match(/sets\/(.+?)-packaging/)?.[1];
    if (slug) return `/catalog/cutouts/${slug}-packaging.png${q}`;
  }
  if (jpegPath.includes("-contents")) {
    const slug = jpegPath.match(/sets\/(.+?)-contents/)?.[1];
    if (slug) return `/catalog/cutouts/${slug}-contents.png${q}`;
  }
  if (jpegPath.includes("/cutouts/") && jpegPath.includes("-contents")) {
    return jpegPath.split("?")[0] + q;
  }
  if (jpegPath.includes("hero-main")) {
    return `/catalog/cutouts/hero-main.png${q}`;
  }
  return jpegPath;
}
