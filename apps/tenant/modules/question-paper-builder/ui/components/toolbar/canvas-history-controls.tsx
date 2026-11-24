"use client";

import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Undo2, Redo2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface CanvasHistoryControlsProps {
  className?: string;
}

export const CanvasHistoryControls: React.FC<CanvasHistoryControlsProps> = ({ className }) => {
  const canUndo = useBuilderStore((state) => state.canUndo);
  const canRedo = useBuilderStore((state) => state.canRedo);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 h-8.5 sm:h-9 px-1 rounded-xl border border-slate-200 dark:border-white/10 bg-card text-foreground select-none font-headline shrink-0 shadow-2xs transition-all",
        className
      )}
    >
      {/* Undo Button */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => undo()}
        className={cn(
          "p-1.5 rounded-lg text-muted-foreground transition-colors cursor-pointer",
          canUndo
            ? "hover:text-foreground hover:bg-muted active:scale-95"
            : "opacity-30 cursor-not-allowed pointer-events-none"
        )}
        title="পূর্বাবস্থায় ফিরুন (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      {/* Redo Button */}
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => redo()}
        className={cn(
          "p-1.5 rounded-lg text-muted-foreground transition-colors cursor-pointer",
          canRedo
            ? "hover:text-foreground hover:bg-muted active:scale-95"
            : "opacity-30 cursor-not-allowed pointer-events-none"
        )}
        title="পুনরায় করুন (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
