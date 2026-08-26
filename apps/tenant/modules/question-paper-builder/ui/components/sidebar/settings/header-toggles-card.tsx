"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

export const HeaderTogglesCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  const toggles = [
    { key: "showClassName", label: "শ্রেণির নাম" },
    { key: "showSubjectName", label: "বিষয়ের নাম" },
    { key: "showChapterName", label: "অধ্যায়ের নাম" },
    { key: "showSetCode", label: "সেট কোড" },
    { key: "showExamName", label: "পরীক্ষার নাম" },
    { key: "showTime", label: "সময়" },
    { key: "showTotalMarks", label: "পূর্ণমান" },
    { key: "showReference", label: "প্রশ্নের উৎস (Reference)" },
  ];

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">হেডার সেটিং</h3>
      </div>

      <div className="space-y-2 mb-4 pb-4 border-b">
        <Label className="text-xs text-muted-foreground">হেডার টেমপ্লেট</Label>
        <Select 
          value={settings.headerTemplate || "classic"} 
          onValueChange={(v: any) => updateSettings({ headerTemplate: v })}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">ক্লাসিক (কেন্দ্রিক)</SelectItem>
            <SelectItem value="modern">মডার্ন (স্তরীভূত)</SelectItem>
            <SelectItem value="left-aligned">বাম-সারিবদ্ধ</SelectItem>
            <SelectItem value="minimal">সংক্ষিপ্ত (Minimal)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {toggles.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
            <Switch 
              id={key}
              checked={settings[key as keyof typeof settings] as boolean}
              onCheckedChange={(c) => updateSettings({ [key]: c })}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
