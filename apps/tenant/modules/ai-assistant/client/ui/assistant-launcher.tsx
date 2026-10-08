"use client";

import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useAssistant } from "../assistant-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

export const AssistantLauncher: React.FC = () => {
  const { toggleOpen, isOpen } = useAssistant();

  // Keyboard shortcut listener (Ctrl+J or ⌘+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleOpen]);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40 print:hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleOpen}
              size="icon"
              className="w-13 h-13 rounded-full shadow-xl bg-gradient-to-tr from-primary to-primary/80 hover:scale-105 active:scale-95 text-white transition-all cursor-pointer relative group flex items-center justify-center border-2 border-white/20"
              aria-label="AI সহকারী খুলুন (Ctrl+J)"
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-sans text-xs">
            AI সহকারী (Ctrl+J)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
