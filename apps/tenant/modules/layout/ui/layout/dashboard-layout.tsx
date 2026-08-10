"use client";

import { useState } from "react";

import { DashboardSidebar } from "./dashboard-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { SpeedDial } from "./speed-dial";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex w-full bg-background relative overflow-hidden">
      {/* Decorative Background Elements — fixed so they don't affect scroll */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Light mode orbs */}
        <div className="dark:hidden absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="dark:hidden absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-[100px]" />
        <div className="dark:hidden absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-[110px]" />
        {/* Dark mode lightning orbs — very subtle, barely visible depth */}
        <div className="hidden dark:block absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[160px]" style={{background: "radial-gradient(ellipse, rgba(0,229,160,0.03) 0%, transparent 70%)"}} />
        <div className="hidden dark:block absolute top-[30%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[140px]" style={{background: "radial-gradient(ellipse, rgba(56,189,248,0.02) 0%, transparent 70%)"}} />
        <div className="hidden dark:block absolute -bottom-[10%] left-[15%] w-[45%] h-[45%] rounded-full blur-[150px]" style={{background: "radial-gradient(ellipse, rgba(0,229,160,0.025) 0%, transparent 70%)"}} />
      </div>

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* main is now the scroll container — this makes sticky header work */}
      <main className="flex-1 min-w-0 flex flex-col relative z-10 h-screen overflow-y-auto overflow-x-hidden pb-16 lg:pb-0">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Viewport-level Speed Dial FAB */}
      <SpeedDial />
    </div>
  );
};
