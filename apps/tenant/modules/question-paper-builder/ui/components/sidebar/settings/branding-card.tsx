"use client";

import React from "react";
import { useBuilderStore } from "../../../../store/use-builder-store";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Input } from "@workspace/ui/components/input";

export const BrandingCard: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const updateSettings = useBuilderStore((state) => state.updateSettings);

  return (
    <div className="p-4 border rounded-xl bg-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-sm">ব্র্যান্ডিং ও নিরাপত্তা</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="showLogo" className="text-sm font-medium">প্রতিষ্ঠানের লোগো</Label>
          <Switch 
            id="showLogo"
            checked={settings.showLogo}
            onCheckedChange={(c) => updateSettings({ showLogo: c })}
          />
        </div>
        {settings.showLogo && (
            <Input 
              placeholder="লোগোর ইউআরএল (ঐচ্ছিক)" 
            value={settings.logoUrl || ""}
            onChange={(e) => updateSettings({ logoUrl: e.target.value })}
            className="h-8 text-xs"
          />
        )}

        <div className="border-t pt-3 flex items-center justify-between">
          <Label htmlFor="showAddress" className="text-sm font-medium">প্রতিষ্ঠানের ঠিকানা</Label>
          <Switch 
            id="showAddress"
            checked={settings.showAddress}
            onCheckedChange={(c) => updateSettings({ showAddress: c })}
          />
        </div>
        {settings.showAddress && (
          <Input 
            placeholder="ঠিকানা লিখুন" 
            value={settings.address || ""}
            onChange={(e) => updateSettings({ address: e.target.value })}
            className="h-8 text-xs"
          />
        )}

        <div className="border-t pt-3 flex items-center justify-between">
          <Label htmlFor="showWatermark" className="text-sm font-medium">জলছাপ (Watermark)</Label>
          <Switch 
            id="showWatermark"
            checked={settings.showWatermark}
            onCheckedChange={(c) => updateSettings({ showWatermark: c })}
          />
        </div>
        {settings.showWatermark && (
          <Input 
            placeholder="জলছাপের টেক্সট লিখুন..." 
            value={settings.watermark || ""}
            onChange={(e) => updateSettings({ watermark: e.target.value })}
            className="h-8 text-xs"
          />
        )}
      </div>
    </div>
  );
};
