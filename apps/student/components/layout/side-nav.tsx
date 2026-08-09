"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@workspace/auth/client"
import Image from "next/image"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  User,
  Settings,
  LogOut,
  Trophy,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/question-bank", label: "Question Bank", mobileLabel: "Questions", icon: BookOpen },
  { href: "/exams", label: "Exams", mobileLabel: "Exams", icon: ClipboardList },
  { href: "/leaderboard", label: "Leaderboard", mobileLabel: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", mobileLabel: "Profile", icon: User },
]

export function SideNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant/30 bg-surface-container-low md:flex">
      {/* Header Section */}
      <div className="flex flex-col gap-1 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded text-on-primary-container">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="font-extrabold text-xl text-primary leading-none tracking-wider">
              Mr. Dr.
            </h2>
            <span className="mt-1 text-[8px] font-semibold text-outline uppercase tracking-wider">
              Academic & Admission Care
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="mt-4 flex-1">
        <div className="flex flex-col">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)

            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3.5 px-6 py-3.5 transition-all duration-200 ${isActive
                  ? "sidebar-item-active font-bold text-primary border-r-4 border-primary bg-surface-container-high"
                  : "text-on-surface-variant hover:bg-surface-container-high font-medium"
                  }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="text-sm font-semibold">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-outline-variant/30 py-4">
        <Link
          href="/settings"
          className="group flex items-center gap-3.5 px-6 py-3.5 text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high font-medium"
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span className="text-sm font-semibold">
            Settings
          </span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3.5 px-6 py-3.5 text-error transition-all duration-200 hover:bg-error-container/20 cursor-pointer font-medium"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <span className="text-sm font-semibold">
            Logout
          </span>
        </button>
      </div>
    </aside>
  )
}
