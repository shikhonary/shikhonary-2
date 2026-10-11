"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { useBuilderStore } from "../../../store/use-builder-store";
import { useGeneratePaperSets } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import { Check, Copy, FileText, Layers, ListOrdered, Loader2, Shuffle, Sparkles } from "lucide-react";

interface GenerateSetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPaperTitle: string;
  originalPaper?: any;
}

const SET_CODES = ["ক", "খ", "গ", "ঘ"];

const toBengaliDigits = (num: number | string): string => {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bn[parseInt(d, 10)] || d);
};

export const GenerateSetsModal: React.FC<GenerateSetsModalProps> = ({
  open,
  onOpenChange,
  originalPaperTitle,
}) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const { mutateAsync: generateSets, isPending: isGenerating } = useGeneratePaperSets();
  const [numSets, setNumSets] = useState(4);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);

  const handleGenerate = async () => {
    if (!paperId) return;
    try {
      const setCodes = SET_CODES.slice(0, numSets);
      await generateSets({
        sourcePaperId: paperId,
        setCodes,
        shuffleQuestions,
        shuffleOptions,
      });

      toast.success(`${toBengaliDigits(numSets)}টি সেট সফলভাবে তৈরি করা হয়েছে!`);
      useBuilderStore.getState().requestRehydrate();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "সেট তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-display sm:max-w-lg p-0 overflow-hidden bg-card border-border shadow-xl">
        {/* Themed Header with Tinted Indigo Accent */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-indigo-500/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-headline text-foreground leading-snug">
                প্রশ্নপত্রের একাধিক সেট তৈরি
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5">
                মূল প্রশ্নপত্র থেকে প্রশ্ন ও বিকল্পগুলোর ক্রম পরিবর্তন করে নতুন সেট তৈরি করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 font-body text-xs sm:text-sm max-h-[75vh] overflow-y-auto">
          {/* Source Paper Banner */}
          {originalPaperTitle && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 shadow-2xs">
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground font-medium block">মূল প্রশ্নপত্র:</span>
                <span className="font-bold text-foreground font-headline truncate block mt-0.5">
                  {originalPaperTitle}
                </span>
              </div>
              <Badge variant="secondary" className="text-[11px] font-bold shrink-0 bg-background border border-border/80">
                উৎস প্রশ্নপত্র
              </Badge>
            </div>
          )}

          {/* Number of Sets Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-headline text-foreground">
                কয়টি সেট তৈরি করতে চান?
              </label>
              <Badge
                variant="outline"
                className="text-[11px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-headline"
              >
                {toBengaliDigits(numSets)}টি সেট নির্বাচিত
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[2, 3, 4].map((num) => {
                const isSelected = numSets === num;
                const codes = SET_CODES.slice(0, num).join(", ");
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumSets(num)}
                    className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs active:scale-98 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-foreground ring-2 ring-indigo-500/30"
                        : "border-border/80 bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold font-headline text-foreground">
                        {toBengaliDigits(num)}টি সেট
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-body">
                      সেট: {codes}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Set Codes Preview Strip */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground font-headline uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>তৈরি হতে যাওয়া সেটসমূহ:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SET_CODES.slice(0, numSets).map((code) => (
                <div
                  key={code}
                  className="flex-1 min-w-[70px] py-1.5 px-3 rounded-lg bg-card border border-border/80 shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span className="size-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span className="font-bold font-headline text-xs text-foreground">সেট {code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shuffling Options */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold font-headline text-foreground flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>শাফল (Shuffle) কনফিগারেশন:</span>
            </label>

            <div className="space-y-2">
              {/* Shuffle Questions */}
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-slot="switch"]')) return;
                  setShuffleQuestions((prev) => !prev);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                  shuffleQuestions
                    ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/50"
                    : "bg-background border-border/80 hover:bg-muted/30"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-headline text-foreground">
                      প্রশ্নের ক্রম এলোমেলো করুন
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body">
                    প্রতিটি সেটে প্রশ্নের সিরিয়াল নম্বর ও অবস্থান ভিন্ন হবে
                  </p>
                </div>
                <Switch
                  checked={shuffleQuestions}
                  onCheckedChange={setShuffleQuestions}
                />
              </div>

              {/* Shuffle Options */}
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('[data-slot="switch"]')) return;
                  setShuffleOptions((prev) => !prev);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
                  shuffleOptions
                    ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/50"
                    : "bg-background border-border/80 hover:bg-muted/30"
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-headline text-foreground">
                      বিকল্পের ক্রম এলোমেলো করুন
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-body">
                    বহুনির্বাচনি প্রশ্নের অপশনগুলোর (ক, খ, গ, ঘ) ক্রম পরিবর্তন হবে
                  </p>
                </div>
                <Switch
                  checked={shuffleOptions}
                  onCheckedChange={setShuffleOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold font-headline rounded-xl cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto h-9 px-4.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-headline text-xs cursor-pointer gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{toBengaliDigits(numSets)}টি সেট তৈরি করুন</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
