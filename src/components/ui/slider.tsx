import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const thumbCount = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
      ? defaultValue.length
      : 1;

  return (
    <SliderPrimitive.Root
      className={cn("w-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="center"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-10 w-full touch-none items-center select-none data-disabled:opacity-50">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-brand-blue/15"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="h-full rounded-full bg-primary"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block size-5 shrink-0 rounded-full border-2 border-white bg-primary shadow-md ring-2 ring-primary/25 transition-shadow select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:scale-110 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };

/** Base UI passes a scalar for single-thumb sliders and an array for ranges. */
export function readSliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") return value;
  return value[0] ?? 0;
}

export function readSliderRange(value: number | readonly number[]): [number, number] {
  if (typeof value === "number") return [value, value];
  return [value[0] ?? 0, value[1] ?? value[0] ?? 0];
}
