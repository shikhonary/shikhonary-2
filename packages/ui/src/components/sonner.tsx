"use client"

import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const Toaster = ({
  closeButton = true,
  className,
  icons,
  style,
  toastOptions,
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className={cn("toaster group font-solaiman", className)}
      closeButton={closeButton}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-3.5" />,
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--toast-close-button-start": "unset",
          "--toast-close-button-end": "0.75rem",
          fontFamily:
            'var(--font-solaiman, "SolaimanLipi", "Kalpurush", "AdorshoLipi", sans-serif)',
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-solaiman",
          content: "pr-6",
          title: "font-solaiman",
          description: "font-solaiman text-muted-foreground",
          actionButton: "font-solaiman font-medium mr-6",
          cancelButton: "font-solaiman font-medium mr-2",
          closeButton:
            "!left-auto !right-3 !top-1/2 !-translate-y-1/2 group-has-[[data-description]]:!top-3.5 group-has-[[data-description]]:!translate-y-0 !bg-popover !text-muted-foreground hover:!text-foreground !border-border hover:!bg-muted transition-colors cursor-pointer",
          ...toastOptions?.classNames,
        },
        style: {
          fontFamily:
            'var(--font-solaiman, "SolaimanLipi", "Kalpurush", "AdorshoLipi", sans-serif)',
          ...toastOptions?.style,
        },
        ...toastOptions,
      }}
      {...props}
    />
  )
}

export { Toaster, toast }

