"use client"

import { useState, useEffect } from "react"
import { SideNav } from "./side-nav"
import { TopNav } from "./top-nav"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-collapse on screens less than desktop view (1280px / xl breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="bg-background text-foreground min-h-screen flex font-sans w-full min-w-0">
      {/* Side Navigation (Desktop & Tablet) */}
      <SideNav
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Wrapper */}
      <div
        className={`flex flex-1 flex-col min-h-screen transition-all duration-300 w-full min-w-0 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top Navigation (Sticky Header) */}
        <TopNav />

        {/* Main Workspace Canvas with Unified Max Width */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="w-full max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
