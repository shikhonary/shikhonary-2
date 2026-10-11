"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@workspace/ui/lib/utils"

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  size?: "sm" | "default"
}

function Switch({
  className,
  size = "default",
  ...props
}: SwitchProps) {
  const isSm = size === "sm"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Base track styling with tactile inner shadow
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 select-none shadow-inner",
        // Dimensions & padding
        isSm ? "h-4.5 w-8 p-0.5 border border-transparent" : "h-6 w-11 p-0.5 border border-transparent",
        // Track colors
        "data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-700/40 dark:data-[state=checked]:border-indigo-400/30",
        "data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-zinc-700 data-[state=unchecked]:border-slate-400/40 dark:data-[state=unchecked]:border-zinc-600/50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Realistic 3D white knob with drop shadow and border
          "pointer-events-none block rounded-full bg-white dark:bg-white border border-black/10 dark:border-black/20 shadow-[0_2px_4px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-in-out will-change-transform",
          // Sizing & translation
          isSm
            ? "size-3.5 data-[state=checked]:translate-x-3.5 data-[state=unchecked]:translate-x-0"
            : "size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
