"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  User,
  Trophy,
} from "lucide-react"

const mobileNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/question-bank", label: "Questions", icon: BookOpen },
  { href: "/exams", label: "Exams", icon: ClipboardList },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant/30 bg-surface-container-low md:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive
                ? "text-primary font-bold"
                : "text-on-surface-variant font-medium hover:text-on-surface"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
