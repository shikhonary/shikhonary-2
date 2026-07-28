"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@workspace/auth/client"
import {
  LayoutDashboard,
  GraduationCap,
  Shield,
  BookOpen,
  BookMarked,
  HelpCircle,
  Users,
  ClipboardList,
  Layers,
  Library,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

type NavGroup = {
  groupLabel: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    groupLabel: "General",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: "Academic Hub",
    items: [
      { href: "/academic-classes", label: "Classes", icon: GraduationCap },
      { href: "/students", label: "Students", icon: Users },
      { href: "/subjects", label: "Subjects", icon: BookOpen },
      { href: "/chapters", label: "Chapters", icon: BookMarked },
    ],
  },
  {
    groupLabel: "Assessments",
    items: [
      { href: "/mcqs", label: "MCQs", icon: HelpCircle },
      { href: "/question-bank", label: "Question Bank", icon: Library },
      { href: "/exams", label: "Exams", icon: ClipboardList },
      { href: "/exam-groups", label: "Exam Groups", icon: Layers },
    ],
  },
  {
    groupLabel: "Administration",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/roles", label: "Roles", icon: Shield },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
]

interface SideNavProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function SideNav({ isCollapsed = false, onToggle }: SideNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/auth/sign-in")
  }

  return (
    <nav
      className={`h-screen fixed left-0 top-0 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant hidden md:flex flex-col py-4 z-50 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 mb-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/40">
            <Image
              alt="Medical Institution Logo"
              className="w-full h-full object-cover"
              src="/logo.jpg"
              width={40}
              height={40}
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-headline-sm text-headline-sm font-extrabold text-primary leading-tight">
                Mr. Dr.
              </h1>
              <p className="font-caption text-caption text-on-surface-variant">
                Clinical Excellence
              </p>
            </div>
          )}
        </div>

        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto px-2 py-3 select-none">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            {!isCollapsed && (
              <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-outline block mt-2 first:mt-0">
                {group.groupLabel}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 transition-all duration-200 ease-in-out ${
                    isCollapsed ? "justify-center px-2 py-2" : "px-3 py-2 rounded-r-lg border-l-4"
                  } ${
                    isActive
                      ? "bg-surface-container-high text-primary rounded-r-lg font-bold border-primary"
                      : "text-on-surface-variant hover:bg-surface-variant border-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-label-md text-label-md whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* CTA & Footer */}
      <div className="mt-auto flex flex-col gap-3 px-4 pt-4 border-t border-outline-variant/30">
        {!isCollapsed && (
          <Link href="/students/create" className="w-full block">
            <button className="w-full bg-primary-container text-on-primary-container font-label-md text-label-md py-2 rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 shadow-sm border border-transparent cursor-pointer">
              Enroll New Student
            </button>
          </Link>
        )}
        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 text-on-surface-variant hover:bg-surface-variant rounded-lg py-2 transition-all duration-200 ease-in-out cursor-pointer ${
            isCollapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="font-label-md text-label-md">Logout</span>}
        </button>
      </div>
    </nav>
  )
}

