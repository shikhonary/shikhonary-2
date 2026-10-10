"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";
import { ShieldCheck, Image as ImageIcon, MapPin, Stamp } from "lucide-react";

export const BrandingCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-4 shadow-xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground">
            ব্র্যান্ডিং ও জলছাপ
          </h3>
          <p className="text-[11px] text-muted-foreground font-body">
            লোগো, ঠিকানা ও নিরাপত্তা ওয়াটারমার্ক
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* Logo Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="showLogo" className="text-xs sm:text-sm font-semibold text-foreground font-headline cursor-pointer">
                প্রতিষ্ঠানের লোগো
              </Label>
            </div>
            <Switch 
              id="showLogo"
              checked={Boolean(settings.showLogo)}
              onCheckedChange={(c) => updateSettings({ showLogo: c })}
              className="data-[state=checked]:bg-indigo-600 cursor-pointer"
            />
          </div>
          {settings.showLogo && (
            <Input 
              placeholder="লোগোর ইমেজ ইউআরএল (ঐচ্ছিক)" 
              value={settings.logoUrl || ""}
              onChange={(e) => updateSettings({ logoUrl: e.target.value })}
              className="h-8 text-xs rounded-xl bg-card border-slate-200 dark:border-white/10 font-body focus-visible:ring-indigo-500 animate-in fade-in-50 duration-200"
            />
          )}
        </div>

        {/* Address Toggle */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="showAddress" className="text-xs sm:text-sm font-semibold text-foreground font-headline cursor-pointer">
                প্রতিষ্ঠানের ঠিকানা
              </Label>
            </div>
            <Switch 
              id="showAddress"
              checked={Boolean(settings.showAddress)}
              onCheckedChange={(c) => updateSettings({ showAddress: c })}
              className="data-[state=checked]:bg-indigo-600 cursor-pointer"
            />
          </div>
          {settings.showAddress && (
            <Input 
              placeholder="ঠিকানা লিখুন (যেমন: মিরপুর-১০, ঢাকা)" 
              value={settings.address || ""}
              onChange={(e) => updateSettings({ address: e.target.value })}
              className="h-8 text-xs rounded-xl bg-card border-slate-200 dark:border-white/10 font-body focus-visible:ring-indigo-500 animate-in fade-in-50 duration-200"
            />
          )}
        </div>

        {/* Watermark Toggle */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Stamp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <Label htmlFor="showWatermark" className="text-xs sm:text-sm font-semibold text-foreground font-headline cursor-pointer">
                জলছাপ (Watermark)
              </Label>
            </div>
            <Switch 
              id="showWatermark"
              checked={Boolean(settings.showWatermark)}
              onCheckedChange={(c) => updateSettings({ showWatermark: c })}
              className="data-[state=checked]:bg-indigo-600 cursor-pointer"
            />
          </div>
          {settings.showWatermark && (
            <Input 
              placeholder="জলছাপের টেক্সট লিখুন..." 
              value={settings.watermark || ""}
              onChange={(e) => updateSettings({ watermark: e.target.value })}
              className="h-8 text-xs rounded-xl bg-card border-slate-200 dark:border-white/10 font-body focus-visible:ring-indigo-500 animate-in fade-in-50 duration-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};
