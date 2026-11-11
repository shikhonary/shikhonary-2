"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@workspace/ui/lib/utils";
import { useBuilderStore } from "../../../store/use-builder-store";

const EditableField: React.FC<{
  value: string | number;
  field: string;
  as?: "input" | "textarea";
  className?: string;
  placeholder?: string;
  editable?: boolean;
}> = ({ value, field, as = "input", className, placeholder, editable = false }) => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const updateSettings = useBuilderStore((state) => state.updateSettings);
  const canEdit = Boolean(editable && !isExporting && as === "input");

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value ?? ""));
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== String(value ?? "")) {
      updateSettings({ [field]: trimmed });
    } else if (!trimmed) {
      setDraft(String(value ?? ""));
    }
    setIsEditing(false);
  };

  if (canEdit && isEditing) {
    const isBlock = className?.includes("block");
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            setDraft(String(value ?? ""));
            setIsEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          className,
          isBlock ? "w-full block" : "inline-block min-w-[80px]",
          "bg-background/95 border border-primary/60 rounded px-1.5 py-0 outline-none focus:ring-1 focus:ring-primary text-foreground print:hidden"
        )}
      />
    );
  }

  if (!value && !canEdit) return null;

  if (as === "textarea") {
    return (
      <div className={cn("w-full block whitespace-pre-wrap", className)}>
        {value}
      </div>
    );
  }

  return (
    <span
      onClick={canEdit ? (e) => {
        e.stopPropagation();
        setDraft(String(value ?? ""));
        setIsEditing(true);
      } : undefined}
      title={canEdit ? "সম্পাদনা করতে ক্লিক করুন" : undefined}
      className={cn(
        className,
        className?.includes("block") ? "w-full block" : "inline-block",
        canEdit && "cursor-pointer hover:bg-primary/10 hover:ring-1 hover:ring-primary/30 rounded px-1 -mx-1 transition-colors print:hover:bg-transparent print:hover:ring-0",
        !value && canEdit && "text-muted-foreground/60 italic"
      )}
    >
      {value || placeholder}
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
    <div className="flex items-center gap-2 font-bold">
      <span className="text-sm font-bold">সেট :</span>
      <div className="border-[1px] border-black flex items-center justify-center font-bold rounded-none w-6 h-6 overflow-visible">
        <span className="text-center font-bold">{settings.setCode || "ক"}</span>
      </div>
    </div>
  );
};

const HeaderTimeMarks = ({ settings, className = "" }: { settings: any, className?: string }) => {
  return (
    <div className={cn("flex justify-between items-center py-0 -mt-0.5 mb-0 px-1 text-sm font-bold border-b border-black", className)}>
      {settings.showTime ? (
        <div className="flex items-center whitespace-nowrap">
          <span className="font-bold mr-1">সময় —</span>
          <EditableField value={settings.time} field="time" placeholder="সময়" className="font-bold" />
        </div>
      ) : <div />}
      
      {settings.showTotalMarks ? (
        <div className="flex items-center whitespace-nowrap text-right">
          <span className="font-bold mr-1">পূর্ণমান —</span>
          <EditableField value={settings.totalMarks} field="totalMarks" placeholder="পূর্ণমান" className="font-bold" />
        </div>
      ) : <div />}
    </div>
  );
};

const HeaderInstructions = ({ settings }: { settings: any }) => {
  return (
    <>
      {settings.showInstructions && (
        <div className="mb-0 px-1 text-sm font-bold pt-0 -mt-0.5 text-center">
          <EditableField value={settings.instructions} field="instructions" as="textarea" className="w-full font-bold leading-tight text-center" placeholder="নির্দেশনা লিখুন..." />
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
  <div className="relative mb-0.5 break-inside-avoid font-bold">
    <div className="flex flex-col items-center justify-center relative mb-0">
      <div className="absolute left-0 top-0"><HeaderLogo settings={settings} /></div>
      <div className="absolute right-0 top-0"><HeaderSetCode settings={settings} /></div>

      <div className="text-center -space-y-1 w-full">
        <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 mx-auto text-center", isNarrow ? "text-xl" : "text-3xl")} />
        {settings.showExamName && <EditableField value={settings.examName} field="examName" editable placeholder="পরীক্ষার নাম" className={cn("font-bold block leading-none mx-auto text-center", isNarrow ? "text-lg" : "text-2xl")} />}
        {settings.showClassName && <EditableField value={settings.className} field="className" editable placeholder="শ্রেণি" className={cn("block font-bold leading-none mx-auto text-center", isNarrow ? "text-sm" : "text-lg")} />}
        {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className={cn("block font-bold leading-none mx-auto text-center", isNarrow ? "text-sm" : "text-lg")} />}
      </div>
    </div>
    <HeaderTimeMarks settings={settings} />
  </div>
);

// 2. Modern Layout (Stacked, Logo Centered Above Text)
const ModernLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid font-bold">
    <div className="flex flex-col items-center justify-center -space-y-1 mb-0">
      <HeaderLogo settings={settings} />
      <div className="text-center -space-y-1 w-full relative">
        <div className="absolute right-0 top-0"><HeaderSetCode settings={settings} /></div>
        <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 mx-auto text-center", isNarrow ? "text-2xl" : "text-3xl")} />
        {settings.showExamName && <EditableField value={settings.examName} field="examName" editable placeholder="পরীক্ষার নাম" className={cn("font-bold block leading-none mx-auto text-center", isNarrow ? "text-xl" : "text-2xl")} />}
        {settings.showClassName && <EditableField value={settings.className} field="className" editable placeholder="শ্রেণি" className={cn("block font-bold leading-none mx-auto text-center", isNarrow ? "text-base" : "text-lg")} />}
        {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className={cn("block font-bold leading-none mx-auto text-center", isNarrow ? "text-base" : "text-lg")} />}
      </div>
    </div>
    <HeaderTimeMarks settings={settings} className="border-t border-black" />
  </div>
);

// 3. Left Aligned Layout
const LeftAlignedLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid font-bold">
    <div className="flex items-start justify-between mb-0">
      <div className="flex gap-4 items-start">
        <HeaderLogo settings={settings} />
        <div className="text-left -space-y-1">
          <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold block leading-[1.1] mb-0 text-left", isNarrow ? "text-lg" : "text-2xl")} />
          {settings.showExamName && <EditableField value={settings.examName} field="examName" editable placeholder="পরীক্ষার নাম" className={cn("font-bold block leading-none text-left", isNarrow ? "text-base" : "text-xl")} />}
          <div className={cn("flex gap-3 font-bold leading-none", isNarrow ? "text-sm" : "text-base")}>
            {settings.showClassName && <EditableField value={settings.className} field="className" editable placeholder="শ্রেণি" className="text-left font-bold" />}
            {settings.showSubjectName && <span className="text-muted-foreground font-bold">•</span>}
            {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className="text-left font-bold" />}
          </div>
        </div>
      </div>
      <HeaderSetCode settings={settings} />
    </div>
    <HeaderTimeMarks settings={settings} className="border-t-2 border-black" />
  </div>
);

// 4. Minimal Layout (Compact, No Logo, Inline properties)
const MinimalLayout = ({ settings, isNarrow }: { settings: any, isNarrow: boolean }) => (
  <div className="relative mb-0.5 break-inside-avoid font-bold">
    <div className="flex items-end justify-between border-b-2 border-black pb-0.5 mb-0">
      <div className="text-left -space-y-1 flex-1">
        <div className="flex items-center flex-wrap gap-2">
          <EditableField value={settings.institutionName} field="institutionName" className={cn("font-bold leading-[1.1] text-left", isNarrow ? "text-lg" : "text-xl")} />
          {settings.showExamName && <span className="font-bold leading-none">|</span>}
          {settings.showExamName && <EditableField value={settings.examName} field="examName" editable placeholder="পরীক্ষার নাম" className={cn("font-bold leading-none text-left text-muted-foreground", isNarrow ? "text-lg" : "text-xl")} />}
        </div>
        
        <div className={cn("flex items-center flex-wrap gap-3 font-bold mt-0 leading-none", isNarrow ? "text-sm" : "text-base")}>
          {settings.showClassName && <EditableField value={settings.className} field="className" editable placeholder="শ্রেণি" className="text-left font-bold" />}
          {settings.showSubjectName && <span>—</span>}
          {settings.showSubjectName && <EditableField value={settings.subjectName} field="subjectName" className="text-left font-bold" />}
        </div>
      </div>

      <div className="text-right flex flex-col items-end gap-0 shrink-0 max-w-[40%] overflow-hidden font-bold">
        <HeaderSetCode settings={settings} />
        <div className="flex flex-col text-sm font-bold text-right mt-0">
          {settings.showTime && (
            <div className="flex justify-end items-center gap-1 w-full"><span className="font-bold whitespace-nowrap">সময়:</span><EditableField value={settings.time} field="time" className="max-w-[120px] font-bold" /></div>
          )}
          {settings.showTotalMarks && (
            <div className="flex justify-end items-center gap-1 w-full"><span className="font-bold whitespace-nowrap">পূর্ণমান:</span><EditableField value={settings.totalMarks} field="totalMarks" className="max-w-[100px] font-bold" /></div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const HeaderBlock: React.FC = () => {
  const settings = useBuilderStore((state) => state.settings);
  const isNarrow = settings.paperOrientation === "landscape" && settings.columns === 2;

  switch (settings.headerTemplate) {
    case "modern": return <ModernLayout settings={settings} isNarrow={isNarrow} />;
    case "left-aligned": return <LeftAlignedLayout settings={settings} isNarrow={isNarrow} />;
    case "minimal": return <MinimalLayout settings={settings} isNarrow={isNarrow} />;
    case "classic":
    default:
      return <ClassicLayout settings={settings} isNarrow={isNarrow} />;
  }
};
