"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";

export const OMRSettingsCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const toggleOMRSheet = useBuilderStore((state) => state.toggleOMRSheet);
  const setOMRSetting = useBuilderStore((state) => state.setOMRSetting);

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">OMR সেটিং</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="omr-toggle" className="text-sm font-medium block">OMR শিট যুক্ত করুন</Label>
          <span className="text-[10px] text-muted-foreground">প্রশ্নপত্রের শেষে OMR শিট তৈরি হবে</span>
        </div>
        <Switch 
          id="omr-toggle"
          checked={settings.showOMRSheet}
          onCheckedChange={(c) => toggleOMRSheet(c)}
        />
      </div>

      {settings.showOMRSheet && (
        <>
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">OMR কলাম</Label>
            <div className="flex gap-2">
              {[2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setOMRSetting('columns', cols)}
                  className={`flex-1 py-2 text-xs rounded-lg border ${settings.omrSettings?.columns === cols ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
                >
                  {cols} কলাম
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="roll-toggle" className="text-sm font-medium block">রোল ও রেজিঃ নম্বর গ্রিড</Label>
              <span className="text-[10px] text-muted-foreground">রোল ও রেজিঃ নম্বরের বাবল গ্রিড যুক্ত করুন</span>
            </div>
            <Switch 
              id="roll-toggle"
              checked={settings.omrSettings?.includeRollNumber}
              onCheckedChange={(c) => setOMRSetting('includeRollNumber', c)}
            />
          </div>
        </>
      )}
    </div>
  );
};
