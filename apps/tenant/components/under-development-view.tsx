"use client"

import React from "react"
import Link from "next/link"
import { Construction, ArrowLeft, ScanLine, Globe, Share2, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

const ICONS = {
  scan: ScanLine,
  globe: Globe,
  share: Share2,
  default: Sparkles,
}

interface UnderDevelopmentViewProps {
  title: string
  description: string
  iconName?: keyof typeof ICONS
  badgeText?: string
}

export const UnderDevelopmentView: React.FC<UnderDevelopmentViewProps> = ({
  title,
  description,
  iconName = "default",
  badgeText = "শীঘ্রই আসছে",
}) => {
  const Icon = ICONS[iconName] || ICONS.default
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 rounded-3xl bg-card border border-border/60 p-8 sm:p-10 shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
            <Construction className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          {/* Icon Box */}
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
            <Icon className="w-10 h-10 stroke-[1.75]" />
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              {description}
            </p>
          </div>

          <p className="text-xs text-muted-foreground/80 font-body py-1">
            এই ফিচারটি বর্তমানে উন্নয়নাধীন রয়েছে। খুব শীঘ্রই এটি আপনার প্রতিষ্ঠানের জন্য উন্মুক্ত করা হবে।
          </p>

          <Button asChild variant="outline" className="rounded-xl font-bold cursor-pointer mt-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>ড্যাশবোর্ডে ফিরে যান</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
