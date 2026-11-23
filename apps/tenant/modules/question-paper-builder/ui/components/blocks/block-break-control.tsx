import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { CornerDownRight, FileText, Columns, Check, Ban } from "lucide-react";

interface BlockBreakControlProps {
  id: string;
  className?: string;
  showText?: boolean;
}

/**
 * Visual indicator shown above the question when a manual column or page break is active.
 * Hidden in print mode, clickable to quickly remove the break.
 */
export const BlockBreakIndicator: React.FC<{ id: string }> = ({ id }) => {
  const setBlockBreak = useBuilderStore((state) => state.setBlockBreak);
  const blockBreaks = useBuilderStore((state) => state.settings.blockBreaks);
  const currentBreak = blockBreaks?.[id] || "none";

  if (currentBreak === "none") return null;

  if (currentBreak === "column") {
    return (
      <div className="print:hidden w-full flex items-center justify-center my-0.5 select-none pointer-events-auto">
        <div className="w-full flex items-center gap-2">
          <div className="h-px bg-blue-300 dark:bg-blue-700 flex-1 border-t border-dashed border-blue-400" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBlockBreak(id, "none");
            }}
            className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-headline font-semibold flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs"
            title="ক্লিক করে কলাম ব্রেক বাতিল করুন"
          >
            <Columns className="w-3 h-3 text-blue-600" />
            <span>কলাম ব্রেক</span>
            <span className="text-blue-500 font-normal ml-0.5">(বাতিল করুন)</span>
          </button>
          <div className="h-px bg-blue-300 dark:bg-blue-700 flex-1 border-t border-dashed border-blue-400" />
        </div>
      </div>
    );
  }

  if (currentBreak === "page") {
    return (
      <div className="print:hidden w-full flex items-center justify-center my-0.5 select-none pointer-events-auto">
        <div className="w-full flex items-center gap-2">
          <div className="h-px bg-purple-300 dark:bg-purple-700 flex-1 border-t border-dashed border-purple-400" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBlockBreak(id, "none");
            }}
            className="px-2 py-0.5 text-[10px] rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-headline font-semibold flex items-center gap-1 cursor-pointer hover:bg-purple-100 transition-colors shadow-2xs"
            title="ক্লিক করে পেজ ব্রেক বাতিল করুন"
          >
            <FileText className="w-3 h-3 text-purple-600" />
            <span>পেজ ব্রেক</span>
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

  const getButtonTitle = () => {
    if (currentBreak === "column") return "পরবর্তী কলাম ব্রেক সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    if (currentBreak === "page") return "পরবর্তী পৃষ্ঠা ব্রেক সক্রিয় (পরিবর্তন করতে ক্লিক করুন)";
    return "কলাম বা পেজ ব্রেক যুক্ত করুন";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`px-2 py-1 text-xs border-r flex items-center gap-1 transition-colors cursor-pointer select-none ${
            isBreakActive
              ? currentBreak === "column"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold"
                : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold"
              : "hover:bg-muted text-foreground/80 hover:text-foreground"
          } ${className}`}
          title={getButtonTitle()}
        >
          {currentBreak === "column" ? (
            <Columns className="w-3 h-3 text-blue-600" />
          ) : currentBreak === "page" ? (
            <FileText className="w-3 h-3 text-purple-600" />
          ) : (
            <CornerDownRight className="w-3 h-3 text-muted-foreground" />
          )}

          {showText && (
            <span className="font-headline text-[11px]">
              {currentBreak === "column"
                ? "কলাম ব্রেক"
                : currentBreak === "page"
                ? "পেজ ব্রেক"
                : "ব্রেক"}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1 font-headline z-50 text-xs">
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

        {columns > 1 && (
          <DropdownMenuItem
            onClick={() => setBlockBreak(id, "column")}
            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
              currentBreak === "column" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>পরবর্তী কলামে পাঠান</span>
            </div>
            {currentBreak === "column" && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => setBlockBreak(id, "page")}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${
            currentBreak === "page" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>পরবর্তী পৃষ্ঠায় পাঠান</span>
          </div>
          {currentBreak === "page" && <Check className="w-3.5 h-3.5 text-purple-600" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
