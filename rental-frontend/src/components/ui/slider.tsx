// components/ui/slider.tsx
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

// ένα Thumb component για επαναχρησιμοποίηση
const Thumb = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Thumb
    ref={ref}
    className={cn(
      "block h-5 w-5 rounded-full border bg-background shadow",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
Thumb.displayName = "Thumb"

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

/**
 * Range-aware Slider:
 * - Αν value/defaultValue έχει 2 τιμές, αποδίδει 2 thumbs
 * - Αλλιώς μόνο 1 thumb (όπως το default Radix Slider)
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, value, defaultValue, ...props }, ref) => {
  const count =
    Array.isArray(value) && value.length === 2
      ? 2
      : Array.isArray(defaultValue) && defaultValue.length === 2
      ? 2
      : 1

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={value as any}
      defaultValue={defaultValue as any}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>

      {/* render thumbs */}
      <Thumb />
      {count === 2 && <Thumb />}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
