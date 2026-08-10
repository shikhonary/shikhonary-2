"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Plus,
  UserPlus,
  Coins,
  FileText,
  Building2,
} from "lucide-react"

const QUICK_ACTIONS = [
  {
    href: "/tax-payers/new",
    icon: UserPlus,
    label: "নতুন করদাতা নিবন্ধন",
    desc: "নতুন হোল্ডিং করদাতা যোগ করুন",
    iconBg: "bg-primary/10 text-primary",
    borderColor: "border-primary/20",
  },
  {
    href: "/tax-collection?new=true",
    icon: Coins,
    label: "কর আদায়",
    desc: "বকেয়া করের পরিশোধ রেকর্ড করুন",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  {
    href: "/generate-tax-payment",
    icon: FileText,
    label: "বাৎসরিক কর জেনারেশন",
    desc: "অর্থবছর ভিত্তিক বাৎসরিক কর নির্ধারণ ও রসিদ তৈরি",
    iconBg: "bg-violet-500/10 text-violet-600",
    borderColor: "border-violet-500/20",
  },
  {
    href: "/wards?new=true",
    icon: Building2,
    label: "ওয়ার্ড ব্যবস্থাপনা",
    desc: "ওয়ার্ড তথ্য পরিচালনা করুন",
    iconBg: "bg-orange-500/10 text-orange-600",
    borderColor: "border-orange-500/20",
  },
]

export function SpeedDial() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Only show speed dial on the dashboard home page
  if (pathname !== "/" && pathname !== "/admin") {
    return null
  }

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Speed Dial Container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
        {/* Action Items — staggered upward */}
        {QUICK_ACTIONS.map((action, i) => (
          <div
            key={action.href}
            className="flex items-center gap-3"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
              transition: `opacity 180ms ease ${open ? i * 55 : (3 - i) * 40}ms, transform 200ms ease ${open ? i * 55 : (3 - i) * 40}ms`,
              pointerEvents: open ? "auto" : "none",
            }}
          >
            {/* Label pill */}
            <div className="bg-card border border-border/70 shadow-md rounded-lg px-3 py-1.5">
              <p className="text-xs font-display font-bold text-foreground whitespace-nowrap">{action.label}</p>
            </div>
            {/* Icon button */}
            <Link href={action.href} onClick={() => setOpen(false)}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md border ${action.borderColor} ${action.iconBg} transition-all duration-150 hover:scale-105 active:scale-95`}>
                <action.icon className="h-5 w-5" />
              </div>
            </Link>
          </div>
        ))}

        {/* FAB Toggle Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="দ্রুত কার্যক্রম"
        >
          <Plus
            className="h-6 w-6 transition-transform duration-300"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>
    </div>
  )
}
