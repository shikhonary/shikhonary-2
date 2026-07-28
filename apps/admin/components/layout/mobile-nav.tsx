"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
} from "lucide-react"

const mobileNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/exams", label: "Exams", icon: ClipboardList },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant/30 bg-surface md:hidden">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-primary font-bold" : "text-on-surface-variant font-medium"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] uppercase">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
