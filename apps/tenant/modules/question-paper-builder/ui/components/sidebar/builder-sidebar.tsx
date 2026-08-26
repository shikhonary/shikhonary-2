"use client";

import React, { useState } from "react";
import { Settings, Library, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { AiCopilotPanel } from "./ai-copilot-panel";
import { SettingsPanel } from "./settings-panel";
import { QuestionPickerPanel } from "./question-picker-panel";

type SidebarTab = "settings" | "picker" | "ai";

export const BuilderSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("settings");

  return (
    <div className="w-[380px] border-r bg-card hidden xl:flex flex-col shadow-sm z-10 h-full relative">
      <div className="p-2 border-b">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SidebarTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="settings" className="text-xs gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              সেটিংস
            </TabsTrigger>
            <TabsTrigger value="picker" className="text-xs gap-1.5">
              <Library className="w-3.5 h-3.5" />
              প্রশ্নভাণ্ডার
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs gap-1.5 text-primary data-[state=active]:text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              এআই কোপাইলট
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "settings" && <SettingsPanel />}
        {activeTab === "picker" && <QuestionPickerPanel />}
        {activeTab === "ai" && <AiCopilotPanel />}
      </div>
    </div>
  );
};
