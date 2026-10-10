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
import { AlertTriangle, Download, Loader2, Lock, ShieldAlert } from "lucide-react";

interface PublishBeforeDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperTitle?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const PublishBeforeDownloadModal: React.FC<PublishBeforeDownloadModalProps> = ({
  open,
  onOpenChange,
  paperTitle,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-display sm:max-w-md p-0 overflow-hidden bg-card border-border">
        {/* Header with Amber / Indigo accent */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-amber-500/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-headline text-foreground leading-snug">
                প্রশ্নপত্র প্রকাশ ও ডাউনলোড
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5">
                ডাউনলোড করার পূর্বে স্ট্যাটাস পরিবর্তনের সতর্কতা
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 font-body text-xs sm:text-sm">
          {paperTitle && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[11px] text-muted-foreground block font-medium">প্রশ্নপত্রের নাম:</span>
              <span className="font-bold text-foreground font-headline truncate block mt-0.5">
                {paperTitle}
              </span>
            </div>
          )}

          {/* Warning Notice Box */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold font-headline text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>গুরুত্বপূর্ণ নোটিশ</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              প্রশ্নপত্রটি ডাউনলোড সম্পন্ন করলে এর স্ট্যাটাস স্বয়ংক্রিয়ভাবে <strong>'পাবলিশড (Published)'</strong> হিসেবে সংরক্ষিত হবে।
            </p>
            <div className="flex items-start gap-1.5 pt-1 text-[11px] text-amber-700 dark:text-amber-300/90 font-medium">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>প্রকাশিত হওয়ার পর প্রশ্নপত্রের প্রশ্ন বা নম্বরে আর কোনো পরিবর্তন করা যাবে না।</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold font-headline rounded-xl cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-headline text-xs cursor-pointer gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>প্রকাশ ও ডাউনলোড করুন</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
