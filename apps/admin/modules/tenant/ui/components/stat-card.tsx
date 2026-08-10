import { LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  className?: string
}

export function StatsCard({ title, value, icon: Icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-sm group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="block font-label-sm text-xs font-semibold uppercase tracking-wider text-outline">
            {title}
          </span>
          <div className="font-headline-md text-2xl sm:text-3xl font-extrabold text-on-surface tabular-nums">
            {value}
          </div>
        </div>
        <div className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 transition-transform duration-200 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
