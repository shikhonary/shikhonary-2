"use client";

import React from "react";
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
import { AlertTriangle, ArrowRight, FileQuestion, Layers } from "lucide-react";
import Link from "next/link";

const toBengaliDigits = (num: number | string): string => {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bn[parseInt(d, 10)] || d);
};

export interface IncompletePaperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId: string;
  actionType?: "download" | "generate-sets";
  incompleteDistributions: Array<{
    distributionId: string;
    subjectName?: string;
    questionTypeName?: string;
    questionTypeNameBn?: string | null;
    questionTypeLabel?: string | null;
    targetCount: number;
    addedCount: number;
    questionsToAttempt?: number;
    marksPerQuestion?: number;
  }>;
}

export const IncompletePaperModal: React.FC<IncompletePaperModalProps> = ({
  open,
  onOpenChange,
  paperId,
  actionType = "download",
  incompleteDistributions,
}) => {
  const totalTarget = incompleteDistributions.reduce((acc, d) => acc + (d.targetCount || 0), 0);
  const totalAdded = incompleteDistributions.reduce((acc, d) => acc + (d.addedCount || 0), 0);
  const totalMissing = totalTarget - totalAdded;

  const isDownload = actionType === "download";
  const firstIncompleteDistId = incompleteDistributions[0]?.distributionId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-display sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden bg-card border-border">
        {/* Header with Amber Warning Accent */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-amber-500/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-headline text-foreground leading-snug">
                {isDownload ? "প্রশ্নপত্র সম্পূর্ণ করা আবশ্যক" : "সেট তৈরি করতে প্রশ্নপত্র সম্পূর্ণ করা আবশ্যক"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5 leading-relaxed">
                {isDownload
                  ? "PDF ডাউনলোড করার জন্য সবগুলো সেকশনের নির্ধারিত প্রশ্ন যোগ করা আবশ্যক। নিচের সেকশনগুলো থেকে বাকি প্রশ্ন যোগ করে প্রশ্নপত্রটি সম্পূর্ণ করুন।"
                  : "মাল্টিপল প্রশ্ন সেট (সেট ক, খ, গ, ঘ) তৈরি ও শাফলিংয়ের জন্য প্রতিটি সেকশনের নির্ধারিত প্রশ্ন যোগ করা আবশ্যক।"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 font-body text-xs sm:text-sm">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium">বাকি সেকশন</span>
              <span className="text-base font-bold font-headline text-amber-600 dark:text-amber-400 mt-0.5">
                {toBengaliDigits(incompleteDistributions.length)}টি
              </span>
            </div>
            <div className="flex flex-col border-x border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium">যুক্ত হয়েছে</span>
              <span className="text-base font-bold font-headline text-foreground mt-0.5">
                {toBengaliDigits(totalAdded)}টি
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium">ঘাটতি আছে</span>
              <span className="text-base font-bold font-headline text-rose-600 dark:text-rose-400 mt-0.5">
                {toBengaliDigits(totalMissing)}টি প্রশ্ন
              </span>
            </div>
          </div>

          {/* Detailed Incomplete List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground font-headline px-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>যেসব সেকশনে প্রশ্ন যোগ করা বাকি:</span>
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incompleteDistributions.map((dist, idx) => {
                const missing = dist.targetCount - dist.addedCount;
                return (
                  <div
                    key={dist.distributionId || idx}
                    className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileQuestion className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-foreground font-headline truncate">
                          {dist.questionTypeNameBn || dist.questionTypeName || dist.questionTypeLabel || "প্রশ্ন সেকশন"}
                        </h4>
                        {dist.subjectName && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            বিষয়: {dist.subjectName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 shrink-0"
                      >
                        যুক্ত: {toBengaliDigits(dist.addedCount)}/{toBengaliDigits(dist.targetCount)}টি
                        {missing > 0 && ` (বাকি: ${toBengaliDigits(missing)}টি)`}
                      </Badge>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-2.5 text-xs font-bold rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        asChild
                      >
                        <Link
                          href={`/question-papers/${paperId}/distributions/${dist.distributionId}/pick`}
                          onClick={() => onOpenChange(false)}
                        >
                          <span>যোগ করুন</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer: Close + Primary Action to Pick Missing Questions */}
        <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold font-headline rounded-xl cursor-pointer order-2 sm:order-1"
          >
            বন্ধ করুন
          </Button>
          {firstIncompleteDistId && (
            <Button
              asChild
              className="w-full sm:w-auto h-9 px-4 text-xs font-bold font-headline rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer order-1 sm:order-2"
            >
              <Link
                href={`/question-papers/${paperId}/distributions/${firstIncompleteDistId}/pick`}
                onClick={() => onOpenChange(false)}
              >
                <span>প্রশ্ন বাছাই সম্পন্ন করুন</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
