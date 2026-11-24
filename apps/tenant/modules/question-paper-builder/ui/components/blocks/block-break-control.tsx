import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { BlockBreakType } from "../../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { CornerDownRight, FileText, Columns, Check, Ban, ArrowDownToLine, ArrowUpToLine } from "lucide-react";

interface BlockBreakControlProps {
  id: string;
  className?: string;
  showText?: boolean;
}

/**
 * Visual indicator shown above or below the question when a manual column or page break is active.
 * Hidden in print mode, clickable to quickly remove the break.
 */
export const BlockBreakIndicator: React.FC<{
  id: string;
  position?: "before" | "after";
}> = ({ id, position = "before" }) => {
  const setBlockBreak = useBuilderStore((state) => state.setBlockBreak);
  const blockBreaks = useBuilderStore((state) => state.settings.blockBreaks);
  const currentBreak = blockBreaks?.[id] || "none";

  if (currentBreak === "none") return null;

  const isBefore = currentBreak === "page" || currentBreak === "column";
  const isAfter = currentBreak === "page-after" || currentBreak === "column-after";

  if (position === "before" && !isBefore) return null;
  if (position === "after" && !isAfter) return null;

  const isCol = currentBreak === "column" || currentBreak === "column-after";
  const isPage = currentBreak === "page" || currentBreak === "page-after";

  if (isCol) {
    const label = currentBreak === "column-after" ? "কলাম ব্রেক (এই প্রশ্নের পর)" : "কলাম ব্রেক (আগে)";
    return (
      <div className="print:hidden w-full flex items-center justify-center my-1 select-none pointer-events-auto">
        <div className="w-full flex items-center gap-2">
          <div className="h-px bg-blue-300 dark:bg-blue-700 flex-1 border-t border-dashed border-blue-400" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBlockBreak(id, "none");
            }}
            className="px-2.5 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-headline font-semibold flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs"
            title="ক্লিক করে কলাম ব্রেক বাতিল করুন"
          >
            <Columns className="w-3 h-3 text-blue-600" />
            <span>{label}</span>
            <span className="text-blue-500 font-normal ml-0.5">(বাতিল করুন)</span>
          </button>
          <div className="h-px bg-blue-300 dark:bg-blue-700 flex-1 border-t border-dashed border-blue-400" />
        </div>
      </div>
    );
  }

  if (isPage) {
    const label = currentBreak === "page-after" ? "পেজ ব্রেক (এই প্রশ্নের পর)" : "পেজ ব্রেক (আগে)";
    return (
      <div className="print:hidden w-full flex items-center justify-center my-1 select-none pointer-events-auto">
        <div className="w-full flex items-center gap-2">
          <div className="h-px bg-purple-300 dark:bg-purple-700 flex-1 border-t border-dashed border-purple-400" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBlockBreak(id, "none");
            }}
            className="px-2.5 py-0.5 text-[10px] rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-headline font-semibold flex items-center gap-1 cursor-pointer hover:bg-purple-100 transition-colors shadow-2xs"
            title="ক্লিক করে পেজ ব্রেক বাতিল করুন"
          >
            <FileText className="w-3 h-3 text-purple-600" />
            <span>{label}</span>
            <span className="text-purple-500 font-normal ml-0.5">(বাতিল করুন)</span>
          </button>
          <div className="h-px bg-purple-300 dark:bg-purple-700 flex-1 border-t border-dashed border-purple-400" />
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Dropdown trigger button embedded in hover controls & card headers to switch break mode.
 */
export const BlockBreakButton: React.FC<BlockBreakControlProps> = ({
  id,
  className = "",
  showText = false,
}) => {
  const setBlockBreak = useBuilderStore((state) => state.setBlockBreak);
  const blockBreaks = useBuilderStore((state) => state.settings.blockBreaks);
  const columns = useBuilderStore((state) => state.settings.columns || 1);
  const currentBreak = blockBreaks?.[id] || "none";

  const isBreakActive = currentBreak !== "none";
  const isColActive = currentBreak === "column" || currentBreak === "column-after";
  const isPageActive = currentBreak === "page" || currentBreak === "page-after";

  const getButtonTitle = () => {
    if (currentBreak === "column") return "কলাম ব্রেক (আগে) সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    if (currentBreak === "column-after") return "কলাম ব্রেক (এই প্রশ্নের পর) সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    if (currentBreak === "page") return "পৃষ্ঠা ব্রেক (আগে) সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    if (currentBreak === "page-after") return "পৃষ্ঠা ব্রেক (এই প্রশ্নের পর) সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    return "কলাম বা পেজ ব্রেক যুক্ত করুন";
  };

  const getLabel = () => {
    if (currentBreak === "column") return "কলাম ব্রেক (আগে)";
    if (currentBreak === "column-after") return "কলাম ব্রেক (পরে)";
    if (currentBreak === "page") return "পেজ ব্রেক (আগে)";
    if (currentBreak === "page-after") return "পেজ ব্রেক (পরে)";
    return "ব্রেক";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`px-2 py-1 text-xs border-r flex items-center gap-1 transition-colors cursor-pointer select-none ${
            isBreakActive
              ? isColActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold"
                : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          } ${className}`}
          title={getButtonTitle()}
        >
          {isColActive ? (
            <Columns className="w-3 h-3 text-blue-600" />
          ) : isPageActive ? (
            <FileText className="w-3 h-3 text-purple-600" />
          ) : (
            <CornerDownRight className="w-3 h-3 text-muted-foreground" />
          )}

          {showText && (
            <span className="font-headline text-[11px]">
              {getLabel()}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 font-headline z-50 text-xs">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1 select-none">
          কলাম / পেজ ব্রেক সেটিং
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => setBlockBreak(id, "none")}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            currentBreak === "none" ? "bg-primary/10 text-primary font-bold" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Ban className="w-3.5 h-3.5 text-muted-foreground" />
            <span>স্বাভাবিক ফ্লো (Auto)</span>
          </div>
          {currentBreak === "none" && <Check className="w-3.5 h-3.5" />}
        </DropdownMenuItem>

        {/* ── Break After Section (Recommended for ending the page here) ── */}
        <DropdownMenuSeparator className="my-1" />
        <div className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 select-none flex items-center gap-1">
          <ArrowDownToLine className="w-3 h-3 text-muted-foreground" />
          <span>এই প্রশ্নের পর ব্রেক (Break After):</span>
        </div>

        <DropdownMenuItem
          onClick={() => setBlockBreak(id, "page-after")}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            currentBreak === "page-after" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>এই প্রশ্নের পর পৃষ্ঠা শেষ করুন</span>
          </div>
          {currentBreak === "page-after" && <Check className="w-3.5 h-3.5 text-purple-600" />}
        </DropdownMenuItem>

        {columns > 1 && (
          <DropdownMenuItem
            onClick={() => setBlockBreak(id, "column-after")}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
              currentBreak === "column-after" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>এই প্রশ্নের পর কলাম শেষ করুন</span>
            </div>
            {currentBreak === "column-after" && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </DropdownMenuItem>
        )}

        {/* ── Break Before Section ── */}
        <DropdownMenuSeparator className="my-1" />
        <div className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 select-none flex items-center gap-1">
          <ArrowUpToLine className="w-3 h-3 text-muted-foreground" />
          <span>এই প্রশ্নের আগে ব্রেক (Break Before):</span>
        </div>

        <DropdownMenuItem
          onClick={() => setBlockBreak(id, "page")}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            currentBreak === "page" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>পরবর্তী পৃষ্ঠায় পাঠান (শুরুতে)</span>
          </div>
          {currentBreak === "page" && <Check className="w-3.5 h-3.5 text-purple-600" />}
        </DropdownMenuItem>

        {columns > 1 && (
          <DropdownMenuItem
            onClick={() => setBlockBreak(id, "column")}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
              currentBreak === "column" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>পরবর্তী কলামে পাঠান (শুরুতে)</span>
            </div>
            {currentBreak === "column" && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Quick-action button shown at the bottom of the last item in a page or column.
 * Enables 1-click Break-After so teachers can immediately end the page or column right there.
 */
export const LastItemBreakControl: React.FC<{
  id: string;
  isLastInPage: boolean;
  columns: number;
}> = ({ id, isLastInPage, columns }) => {
  const setBlockBreak = useBuilderStore((state) => state.setBlockBreak);
  const blockBreaks = useBuilderStore((state) => state.settings.blockBreaks);
  const currentBreak = blockBreaks?.[id] || "none";

  const isBreakAfter = currentBreak === "page-after" || currentBreak === "column-after";

  // If a break-after is already active, BlockBreakIndicator position="after" will display it.
  if (isBreakAfter) return null;

  return (
    <div className="print:hidden w-full h-0 flex items-center justify-center overflow-visible relative z-20 opacity-0 hover:opacity-100 group-hover/paged-block:opacity-75 transition-opacity select-none">
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex items-center gap-2 pointer-events-auto">
        <div className="h-px bg-slate-300 dark:bg-zinc-700 flex-1 border-t border-dashed border-slate-300 dark:border-zinc-700" />
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs px-1.5 py-0.5 rounded-full shadow-2xs border border-slate-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBlockBreak(id, "page-after");
            }}
            className="px-2.5 py-0.5 text-[10px] rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-headline font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95"
            title="এই প্রশ্নের পর পৃষ্ঠা শেষ করে পরবর্তী সবকিছু পরের পৃষ্ঠায় পাঠান"
          >
            <FileText className="w-3 h-3 text-purple-600" />
            <span>পৃষ্ঠা ব্রেক (এর পর থেকে)</span>
          </button>

          {columns > 1 && !isLastInPage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBlockBreak(id, "column-after");
              }}
              className="px-2.5 py-0.5 text-[10px] rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-headline font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:scale-105 active:scale-95"
              title="এই প্রশ্নের পর কলাম শেষ করে পরবর্তী সবকিছু পরের কলামে পাঠান"
            >
              <Columns className="w-3 h-3 text-blue-600" />
              <span>কলাম ব্রেক (এর পর থেকে)</span>
            </button>
          )}
        </div>
        <div className="h-px bg-slate-300 dark:bg-zinc-700 flex-1 border-t border-dashed border-slate-300 dark:border-zinc-700" />
      </div>
    </div>
  );
};
