"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";
import { useBuilderStore } from "../../../store/use-builder-store";

const EditableField: React.FC<{
  value: string | number;
  field: string;
  as?: "input" | "textarea";
  className?: string;
  placeholder?: string;
}> = ({ value, as = "input", className }) => {
  if (!value) return null;
  
  if (as === "textarea") {
    return (
      <div className={cn("w-full block whitespace-pre-wrap", className)}>
        {value}
      </div>
    );
  }

  return (
    <span className={cn(className, className?.includes("block") ? "w-full block" : "inline-block")}>
      {value}
    </span>
  );
};

const HeaderLogo = ({ settings }: { settings: any }) => {
  if (!settings.showLogo) return null;
  return (
    <div className="pt-2">
      {settings.logoUrl && !settings.logoUrl.includes("placeholder") ? (
        <Image
          src={settings.logoUrl}
          alt="Logo"
          width={70}
          height={70}
          className="max-w-[70px] max-h-[70px] object-contain"
        />
      ) : (
        <div className="w-16 h-16 border border-dashed border-muted-foreground/30 flex items-center justify-center rounded bg-muted/10">
          <span className="text-[10px] text-muted-foreground font-bold uppercase">Logo</span>
        </div>
      )}
    </div>
  );
};

const HeaderSetCode = ({ settings }: { settings: any }) => {
  if (!settings.showSetCode) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">সেট :</span>
      <div className="border-[1px] border-black flex items-center justify-center font-bold rounded-none w-6 h-6 overflow-visible">
        <span className="text-center font-bold">{settings.setCode || "ক"}</span>
      </div>
    </div>
  );
};

const HeaderTimeMarks = ({ settings, className = "" }: { settings: any, className?: string }) => {
  return (
    <div className={cn("flex justify-between items-center py-0 -mt-0.5 mb-0 px-1 text-sm border-b border-black", className)}>
      {settings.showTime ? (
        <div className="flex items-center whitespace-nowrap">
          <span className="font-bold mr-1">সময় —</span>
          <EditableField value={settings.time} field="time" placeholder="সময়" />
        </div>
      ) : <div />}
      
      {settings.showTotalMarks ? (
        <div className="flex items-center whitespace-nowrap text-right">
          <span className="font-bold mr-1">পূর্ণমান —</span>
          <EditableField value={settings.totalMarks} field="totalMarks" placeholder="পূর্ণমান" />
        </div>
      ) : <div />}
    </div>
  );
};

const HeaderInstructions = ({ settings }: { settings: any }) => {
  return (
    <>
      {settings.showInstructions && (
        <div className="mb-0 px-1 text-sm pt-0 -mt-0.5 text-center">
          <EditableField value={settings.instructions} field="instructions" as="textarea" className="w-full leading-tight text-center" placeholder="নির্দেশনা লিখুন..." />
        </div>
      )}
      {settings.showNoMarkingNote && (
        <div className="text-center -mt-1 mb-0">
          <p className="text-[13px] font-bold inline-block px-4 leading-tight">প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেয়া যাবেনা।</p>
        </div>
      )}
    </>
  );
};

// 1. Classic Layout (Centered, Logo Absolute Left, Set Code Absolute Right)
const ClassicLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid">
    <div className="flex flex-col items-center justify-center relative mb-0">
      <div className="absolute left-0 top-0"><HeaderLogo settings={settings} /></div>
      <div className="absolute right-0 top-0"><HeaderSetCode settings={settings} /></div>

      <div className="text-center -space-y-1 w-full">
        <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 mx-auto text-center", isNarrow ? "text-xl" : "text-3xl")} />
        {settings.showExamName && <EditableField value={settings.examName} field="examName" className={cn("font-bold block leading-none mx-auto text-center", isNarrow ? "text-lg" : "text-2xl")} />}
        {settings.showClassName && <EditableField value={settings.className} field="className" className={cn("block font-medium leading-none mx-auto text-center", isNarrow ? "text-sm" : "text-lg")} />}
        {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className={cn("block font-medium leading-none mx-auto text-center", isNarrow ? "text-sm" : "text-lg")} />}
        {settings.showChapterName && <EditableField value={settings.chapterName} field="chapterName" className={cn("block leading-none mx-auto text-center", isNarrow ? "text-xs" : "text-base")} />}
      </div>
    </div>
    <HeaderTimeMarks settings={settings} />
  </div>
);

// 2. Modern Layout (Stacked, Logo Centered Above Text)
const ModernLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid">
    <div className="flex flex-col items-center justify-center -space-y-1 mb-0">
      <HeaderLogo settings={settings} />
      <div className="text-center -space-y-1 w-full relative">
        <div className="absolute right-0 top-0"><HeaderSetCode settings={settings} /></div>
        <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 mx-auto text-center", isNarrow ? "text-2xl" : "text-3xl")} />
        {settings.showExamName && <EditableField value={settings.examName} field="examName" className={cn("font-bold block leading-none mx-auto text-center", isNarrow ? "text-xl" : "text-2xl")} />}
        {settings.showClassName && <EditableField value={settings.className} field="className" className={cn("block font-medium leading-none mx-auto text-center", isNarrow ? "text-base" : "text-lg")} />}
        {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className={cn("block font-medium leading-none mx-auto text-center", isNarrow ? "text-base" : "text-lg")} />}
        {settings.showChapterName && <EditableField value={settings.chapterName} field="chapterName" className={cn("block leading-none mx-auto text-center", isNarrow ? "text-sm" : "text-base")} />}
      </div>
    </div>
    <HeaderTimeMarks settings={settings} className="border-t border-black" />
  </div>
);

// 3. Left Aligned Layout
const LeftAlignedLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid">
    <div className="flex items-start justify-between mb-0">
      <div className="flex gap-4 items-start">
        <HeaderLogo settings={settings} />
        <div className="text-left -space-y-1">
          <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 text-left", isNarrow ? "text-lg" : "text-2xl")} />
          {settings.showExamName && <EditableField value={settings.examName} field="examName" className={cn("font-bold block leading-none text-left", isNarrow ? "text-base" : "text-xl")} />}
          <div className={cn("flex gap-3 font-medium leading-none", isNarrow ? "text-sm" : "text-base")}>
            {settings.showClassName && <EditableField value={settings.className} field="className" className="text-left" />}
            {settings.showSubjectName && <span className="text-muted-foreground">•</span>}
            {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className="text-left" />}
          </div>
          {settings.showChapterName && <EditableField value={settings.chapterName} field="chapterName" className={cn("block text-left text-muted-foreground leading-none", isNarrow ? "text-xs" : "text-base")} />}
        </div>
      </div>
      <HeaderSetCode settings={settings} />
    </div>
    <HeaderTimeMarks settings={settings} className="border-t-2 border-black" />
  </div>
);

// 4. Minimal Layout (Compact, No Logo, Inline properties)
const MinimalLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid">
    <div className="flex items-end justify-between border-b-2 border-black pb-0.5 mb-0">
      <div className="text-left -space-y-1 flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold leading-[1.1] text-left", isNarrow ? "text-lg" : "text-xl")} />
          {settings.showExamName && <span className="font-bold leading-none">|</span>}
          {settings.showExamName && <EditableField value={settings.examName} field="examName" className={cn("font-bold leading-none text-left text-muted-foreground", isNarrow ? "text-lg" : "text-xl")} />}
        </div>
        
        <div className={cn("flex items-center flex-wrap gap-3 font-medium mt-0 leading-none", isNarrow ? "text-sm" : "text-base")}>
          {settings.showClassName && <EditableField value={settings.className} field="className" className="text-left" />}
          {settings.showSubjectName && <span>—</span>}
          {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className="text-left" />}
          {settings.showChapterName && <span>—</span>}
          {settings.showChapterName && <EditableField value={settings.chapterName} field="chapterName" className="text-left" />}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-0 shrink-0 max-w-[40%] overflow-hidden">
        <HeaderSetCode settings={settings} />
        <div className="flex flex-col text-sm text-right mt-0">
          {settings.showTime && (
            <div className="flex justify-end items-center gap-1 w-full"><span className="font-bold whitespace-nowrap">সময়:</span><EditableField value={settings.time} field="time" className="max-w-[120px]" /></div>
          )}
          {settings.showTotalMarks && (
            <div className="flex justify-end items-center gap-1 w-full"><span className="font-bold whitespace-nowrap">পূর্ণমান:</span><EditableField value={settings.totalMarks} field="totalMarks" className="max-w-[100px]" /></div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const HeaderBlock: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const isNarrow = settings.bookletMode && settings.columns > 1;

  switch (settings.headerTemplate) {
    case "modern": return <ModernLayout settings={settings} isNarrow={isNarrow} />;
    case "left-aligned": return <LeftAlignedLayout settings={settings} isNarrow={isNarrow} />;
    case "minimal": return <MinimalLayout settings={settings} isNarrow={isNarrow} />;
    case "classic":
    default:
      return <ClassicLayout settings={settings} isNarrow={isNarrow} />;
  }
};
