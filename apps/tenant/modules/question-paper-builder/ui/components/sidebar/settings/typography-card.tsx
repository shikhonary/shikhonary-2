"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

const FONT_FAMILIES = [
  { value: "SolaimanLipi", label: "সোলাইমানলিপি" },
  { value: "Kalpurush", label: "কালপুরুষ" },
  { value: "Nikosh", label: "নিকষ" },
  { value: "AdorshoLipi", label: "আদর্শলিপি" },
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
];

export const TypographyCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">ফন্ট ও স্টাইল</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">ফন্টের ধরন</Label>
        <Select 
          value={settings.fontFamily} 
          onValueChange={(v) => updateSettings({ fontFamily: v })}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="ফন্ট নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex justify-between">
          <span>ফন্টের আকার</span>
          <span className="font-medium text-foreground">{settings.fontSize}px</span>
        </Label>
        <input 
          type="range" 
          min={10} 
          max={24} 
          step={1}
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

    </div>
  );
};
