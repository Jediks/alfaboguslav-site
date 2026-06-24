"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/product-image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl premium-shadow">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {images.map((src, i) => (
              <div key={src} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-[4/5] min-h-[420px]">
                  <ProductImage
                    src={src}
                    alt={`${title} ${i + 1}`}
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    variant="minimal"
                    size="xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 glass h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 glass h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all",
                selected === i
                  ? "border-primary shadow-md"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <ProductImage src={src} alt="" sizes="64px" variant="minimal" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
