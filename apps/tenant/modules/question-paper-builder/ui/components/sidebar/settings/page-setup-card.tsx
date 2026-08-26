"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

export const PageSetupCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">পেইজ সেটআপ</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">পেইজ সাইজ</Label>
        <Select 
          value={settings.paperSize} 
          onValueChange={(v: any) => updateSettings({ paperSize: v })}
        >
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="সাইজ নির্বাচন করুন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A4">A4</SelectItem>
            <SelectItem value="Letter">Letter</SelectItem>
            <SelectItem value="Legal">Legal</SelectItem>
            <SelectItem value="A5">A5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">পেইজ ওরিয়েন্টেশন</Label>
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ paperOrientation: "portrait" })}
            className={`flex-1 py-2 text-xs rounded-lg border ${settings.paperOrientation === "portrait" ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
          >
            পোর্ট্রেট
          </button>
          <button
            onClick={() => updateSettings({ paperOrientation: "landscape" })}
            className={`flex-1 py-2 text-xs rounded-lg border ${settings.paperOrientation === "landscape" ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
          >
            ল্যান্ডস্কেপ
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">মার্জিন (মি.মি.)</Label>
        
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ margins: { top: 20, bottom: 20, left: 20, right: 20 } })}
            className="flex-1 py-1.5 text-[10px] rounded border bg-muted hover:bg-muted/80 transition-colors"
          >
            স্বাভাবিক (২০)
          </button>
          <button
            onClick={() => updateSettings({ margins: { top: 10, bottom: 10, left: 10, right: 10 } })}
            className="flex-1 py-1.5 text-[10px] rounded border bg-muted hover:bg-muted/80 transition-colors"
          >
            সংকীর্ণ (১০)
          </button>
          <button
            onClick={() => updateSettings({ margins: { top: 30, bottom: 30, left: 30, right: 30 } })}
            className="flex-1 py-1.5 text-[10px] rounded border bg-muted hover:bg-muted/80 transition-colors"
          >
            চওড়া (৩০)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["top", "bottom", "left", "right"] as const).map((side) => (
            <div key={side} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border">
              <Label className="text-xs capitalize w-12">{side === "top" ? "উপরে" : side === "bottom" ? "নিচে" : side === "left" ? "বামে" : "ডানে"}</Label>
              <input
                type="number"
                value={settings.margins[side]}
                onChange={(e) => 
                  updateSettings({ 
                    margins: { ...settings.margins, [side]: parseInt(e.target.value) || 0 } 
                  })
                }
                className="w-14 h-6 text-sm text-center border rounded bg-background"
                min={0}
                max={100}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">কলাম সংখ্যা</Label>
        <div className="flex gap-2">
          {[1, 2, 3].map((cols) => (
            <button
              key={cols}
              onClick={() => updateSettings({ columns: cols as 1|2|3 })}
              className={`flex-1 py-2 text-xs rounded-lg border ${settings.columns === cols ? "bg-primary/10 border-primary font-medium text-primary" : "bg-muted"}`}
            >
              {cols} কলাম
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="column-divider" className="text-sm font-medium">কলাম ডিভাইডার</Label>
        <Switch 
          id="column-divider"
          checked={settings.showColumnDivider}
          onCheckedChange={(c) => updateSettings({ showColumnDivider: c })}
          disabled={settings.columns === 1}
        />
      </div>

      {settings.columns > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <Label htmlFor="booklet-mode" className="text-sm font-medium block">বুকলেট মোড</Label>
            <span className="text-[10px] text-muted-foreground">প্রতিটি কলামের শুরুতে হেডার দেখাবে</span>
          </div>
          <Switch 
            id="booklet-mode"
            checked={settings.bookletMode}
            onCheckedChange={(c) => {
              if (c) {
                updateSettings({ bookletMode: true, headerTemplate: "modern" });
              } else {
                updateSettings({ bookletMode: false });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
