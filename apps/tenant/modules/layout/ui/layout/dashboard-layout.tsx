"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import DashboardHeader from "./dashboard-header";

import { AssistantProvider, SpeedDialAssistant } from "@/modules/ai-assistant";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on screens less than desktop view (1280px / xl breakpoint)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <AssistantProvider>
      <div className="bg-background text-on-background min-h-screen flex font-sans w-full min-w-0 overflow-x-hidden">
        {/* Side Navigation (Desktop & Tablet) */}
        <DashboardSidebar
          collapsed={isCollapsed}
          onToggle={() => setIsCollapsed((prev) => !prev)}
        />

        {/* Main Content Wrapper */}
        <div
          className={`flex flex-1 flex-col min-h-screen transition-all duration-300 w-full min-w-0 max-w-full ${
            isCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          {/* Top Navigation (Sticky Header) */}
          <DashboardHeader />

          {/* Main Workspace Canvas */}
          <main className="flex-grow p-4 sm:p-6 w-full min-w-0 max-w-full">{children}</main>
        </div>
      </div>
      <SpeedDialAssistant />
    </AssistantProvider>
  );
};
