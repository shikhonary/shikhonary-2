"use client";

import React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2 } from "lucide-react";

interface PickerCardWrapperProps {
  id: string;
  isAssigned?: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  chapterName?: string | null;
  typeLabel?: string | null;
  children: React.ReactNode;
}

export const PickerCardWrapper: React.FC<PickerCardWrapperProps> = ({
  id,
  isAssigned,
  isSelected,
  onToggle,
  chapterName,
  typeLabel,
  children,
}) => {
  return (
    <div
      onClick={() => {
        if (!isAssigned) onToggle(id);
      }}
      className={`bg-card border rounded-2xl p-4 sm:p-5 transition-all relative font-display ${
        isAssigned
          ? "opacity-60 bg-muted/40 border-muted cursor-not-allowed"
          : isSelected
            ? "border-transparent shadow-md cursor-pointer"
            : "hover:border-primary/50 hover:shadow-sm border-outline-variant cursor-pointer"
      }`}
    >
      {/* Animated selection corner borders */}
      <div
        className={`absolute -top-[1px] -left-[1px] w-14 h-14 border-t-4 border-l-4 border-primary rounded-tl-2xl pointer-events-none transition-all duration-200 origin-top-left ${
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
      <div
        className={`absolute -top-[1px] -right-[1px] w-14 h-14 border-t-4 border-r-4 border-primary rounded-tr-2xl pointer-events-none transition-all duration-200 origin-top-right ${
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
      <div
        className={`absolute -bottom-[1px] -left-[1px] w-14 h-14 border-b-4 border-l-4 border-primary rounded-bl-2xl pointer-events-none transition-all duration-200 origin-bottom-left ${
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
      <div
        className={`absolute -bottom-[1px] -right-[1px] w-14 h-14 border-b-4 border-r-4 border-primary rounded-br-2xl pointer-events-none transition-all duration-200 origin-bottom-right ${
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />

      <div
        className={`absolute top-4 right-4 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 z-10 ${
          isAssigned
            ? "bg-muted text-muted-foreground border-muted-foreground/30"
            : isSelected
              ? "bg-primary border-primary text-white"
              : "border-outline-variant bg-white"
        }`}
      >
        {isAssigned ? (
          <span className="text-[10px] font-bold">যোগকৃত</span>
        ) : isSelected ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 pr-16">
        {chapterName && (
          <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground text-xs font-medium">
            {chapterName}
          </Badge>
        )}
        {typeLabel && (
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs font-medium">
            {typeLabel}
          </Badge>
        )}
      </div>

      {children}
    </div>
  );
};
