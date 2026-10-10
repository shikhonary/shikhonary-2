"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Heading } from "lucide-react";

export const HeaderTogglesCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  const toggles = [
    { key: "showClassName", label: "শ্রেণির নাম" },
    { key: "showSubjectName", label: "বিষয়ের নাম" },
    { key: "showSetCode", label: "সেট কোড" },
    { key: "showExamName", label: "পরীক্ষার নাম" },
    { key: "showTime", label: "সময়" },
    { key: "showTotalMarks", label: "পূর্ণমান" },
    { key: "showReference", label: "প্রশ্নের উৎস (Reference)" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <Heading className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            হেডার টেমপ্লেট ও তথ্য
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            প্রশ্নপত্রের শিরোনাম ও দৃশ্যমান তথ্যাদি
          </p>
        </div>
      </div>

      {/* Header Template Selection */}
      <div className="space-y-1.5 pb-3 border-b border-border/60">
        <Label className="text-xs font-semibold text-muted-foreground font-headline">
          হেডার টেমপ্লেট
        </Label>
        <Select 
          value={settings.headerTemplate || "classic"} 
          onValueChange={(v: any) => updateSettings({ headerTemplate: v })}
        >
          <SelectTrigger className="w-full text-xs sm:text-sm h-9 px-3.5 rounded-xl bg-card border-slate-200 dark:border-white/10 font-body">
            <SelectValue placeholder="টেমপ্লেট নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent className="font-body text-xs sm:text-sm rounded-xl">
            <SelectItem value="classic">ক্লাসিক (কেন্দ্রিক বিন্যাস)</SelectItem>
            <SelectItem value="modern">মডার্ন (স্তরীভূত কার্ড)</SelectItem>
            <SelectItem value="left-aligned">বাম-সারিবদ্ধ (অফিসিয়াল)</SelectItem>
            <SelectItem value="minimal">সংক্ষিপ্ত (Minimal)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Header Info Visibility Toggles */}
      <div className="space-y-1.5">
        {toggles.map(({ key, label }) => {
          const isChecked = Boolean(settings[key as keyof typeof settings]);
          return (
            <div 
              key={key} 
              onClick={() => updateSettings({ [key]: !isChecked })}
              className={`flex items-center justify-between py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40"
                  : "bg-muted/20 hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Label 
                htmlFor={key} 
                className="text-xs sm:text-sm font-medium font-headline cursor-pointer pointer-events-none"
              >
                {label}
              </Label>
              <Switch 
                id={key}
                checked={isChecked}
                onCheckedChange={(c) => updateSettings({ [key]: c })}
                className="pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
