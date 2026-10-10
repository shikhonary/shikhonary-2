"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import DashboardHeader from "./dashboard-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

import { AssistantProvider, SpeedDialAssistant } from "@/modules/ai-assistant";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if current route is a specific question paper sub-route (/question-papers/[id]...)
  // Excludes the list page (/question-papers) and create page (/question-papers/create)
  const isQuestionPaperDetailRoute =
    pathname.startsWith("/question-papers/") &&
    !pathname.startsWith("/question-papers/create");

  // Check if current route is full-screen studio builder or distribution picker
  const isStudioRoute =
    pathname.includes("/builder") || pathname.includes("/distributions/");

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
      <div
        className={`bg-background text-on-background flex font-sans w-full min-w-0 ${
          isStudioRoute
            ? "h-screen h-[100dvh] max-h-[100dvh] overflow-hidden"
            : "min-h-screen overflow-x-clip"
        }`}
      >
        {/* Side Navigation (Desktop & Tablet) - Hidden on /question-papers/[id] routes */}
        {!isQuestionPaperDetailRoute && (
          <DashboardSidebar
            collapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
          />
        )}

        {/* Main Content Wrapper */}
        <div
          className={`flex flex-1 flex-col transition-all duration-300 w-full min-w-0 max-w-full ${
            isStudioRoute
              ? "h-full max-h-full min-h-0 overflow-hidden ml-0"
              : isQuestionPaperDetailRoute
              ? "min-h-screen ml-0"
              : isCollapsed
              ? "min-h-screen md:ml-20"
              : "min-h-screen md:ml-64"
          }`}
        >
          {/* Top Navigation (Sticky Header) - Hidden on studio routes (builder and picker) */}
          {!isStudioRoute && <DashboardHeader />}

          {/* Main Workspace Canvas */}
          <main
            className={`w-full min-w-0 max-w-full ${
              isStudioRoute
                ? "flex-1 h-full min-h-0 max-h-full overflow-hidden p-0"
                : isQuestionPaperDetailRoute
                ? "flex-grow p-0"
                : "flex-grow p-4 sm:p-6 pb-20 md:pb-6"
            }`}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Hidden on detail and builder routes */}
      {!isQuestionPaperDetailRoute && <MobileBottomNav />}

      {/* Speed Dial AI Assistant - Hidden on studio routes since builder has its own drawer and picker has dedicated workspace */}
      {!isStudioRoute && <SpeedDialAssistant />}
    </AssistantProvider>
  );
};
