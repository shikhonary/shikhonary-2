"use client";

import React from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { PageSetupCard } from "./settings/page-setup-card";
import { TypographyCard } from "./settings/typography-card";
import { QuestionSettingsCard } from "./settings/question-settings-card";
import { HeaderTogglesCard } from "./settings/header-toggles-card";
import { BrandingCard } from "./settings/branding-card";
import { OMRSettingsCard } from "./settings/omr-settings-card";

export const SettingsPanel: React.FC = () => {
  return (
    <ScrollArea className="h-full bg-muted/10">
      <div className="p-4 space-y-4">
        <PageSetupCard />
        <TypographyCard />
        <QuestionSettingsCard />
        <HeaderTogglesCard />
        <OMRSettingsCard />
        <BrandingCard />
      </div>
    </ScrollArea>
  );
};
