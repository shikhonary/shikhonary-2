"use client";

import React from "react";
import { Settings } from "lucide-react";
import { SettingsPanel } from "./settings-panel";

export const BuilderSidebar: React.FC = () => {
  return (
    <div className="w-[380px] border-r bg-card hidden xl:flex flex-col shadow-sm z-10 h-full relative">
      <div className="p-3 border-b flex items-center gap-2 font-semibold text-sm text-foreground">
        <Settings className="w-4 h-4 text-primary" />
        <span>সেটিংস</span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <SettingsPanel />
      </div>
    </div>
  );
};

