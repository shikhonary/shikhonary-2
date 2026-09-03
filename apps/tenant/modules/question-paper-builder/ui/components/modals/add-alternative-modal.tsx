"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Split, ArrowRight, BookOpen, Layers } from "lucide-react";
import { QUESTION_TYPE_CODES, type QuestionTypeCode } from "@workspace/utils";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

interface AddAlternativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId: string;
  distributionId?: string;
  primaryQuestionId: string;
  primaryQuestionContentId?: string;
  primaryQuestionType: QuestionTypeCode;
  subjectId: string;
  primaryMarks?: number | null;
  masterNumber?: number;
}

const CATEGORY_OPTIONS: { code: QuestionTypeCode; nameBn: string; nameEn: string; desc: string }[] = [
  { code: QUESTION_TYPE_CODES.LETTER, nameBn: "চিঠি / পত্র", nameEn: "Letter", desc: "ব্যক্তিগত বা আনুষ্ঠানিক চিঠি" },
  { code: QUESTION_TYPE_CODES.APPLICATION, nameBn: "আবেদনপত্র / দরখাস্ত", nameEn: "Application", desc: "দাপ্তরিক বা শিক্ষাপ্রতিষ্ঠানের আবেদন" },
  { code: QUESTION_TYPE_CODES.PARAGRAPH, nameBn: "অনুচ্ছেদ", nameEn: "Paragraph", desc: "বিষয়ভিত্তিক অনুচ্ছেদ লিখন" },
  { code: QUESTION_TYPE_CODES.AMPLIFICATION, nameBn: "ভাব-সম্প্রসারণ", nameEn: "Amplification", desc: "উক্তি বা কবিতার ভাব-সম্প্রসারণ" },
  { code: QUESTION_TYPE_CODES.CQ, nameBn: "সৃজনশীল", nameEn: "Creative (CQ)", desc: "উদ্দীপক ও ৪টি স্তরের সৃজনশীল প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.SA, nameBn: "সংক্ষিপ্ত-উত্তর", nameEn: "Short Answer", desc: "সংক্ষিপ্ত রচনামূলক প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.CS, nameBn: "সহপাঠ", nameEn: "Creative Scenario", desc: "নাটক বা উপন্যাস অংশ" },
];

export const AddAlternativeModal: React.FC<AddAlternativeModalProps> = ({
  open,
  onOpenChange,
  paperId,
  distributionId,
  primaryQuestionId,
  primaryQuestionContentId,
  primaryQuestionType,
  subjectId,
  primaryMarks,
  masterNumber,
}) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<QuestionTypeCode>(primaryQuestionType);
  const [orLabel, setOrLabel] = useState("অথবা");

  useEffect(() => {
    if (open) {
      setSelectedCategory(primaryQuestionType);
      setOrLabel("অথবা");
    }
  }, [open, primaryQuestionType]);

  const handleProceedToPicker = () => {
    const distId = distributionId || "default";
    const params = new URLSearchParams();
    params.set("mode", "alternative");
    params.set("parentQuestionId", primaryQuestionId);
    params.set("category", selectedCategory);
    params.set("orLabel", orLabel.trim() || "অথবা");
    if (primaryMarks !== undefined && primaryMarks !== null) {
      params.set("primaryMarks", String(primaryMarks));
    }
    if (masterNumber) {
      params.set("masterNumber", String(masterNumber));
    }
    if (primaryQuestionContentId) {
      params.set("primaryContentId", primaryQuestionContentId);
    }

    onOpenChange(false);
    router.push(`/question-papers/${paperId}/distributions/${distId}/pick?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 font-display">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Split className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold">
              বিকল্প (অথবা) প্রশ্নের ধরন নির্বাচন
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {masterNumber ? `${toBengaliDigits(masterNumber)} নং প্রশ্নের জন্য ` : ""}
            বিকল্প হিসেবে কোন ধরনের প্রশ্ন নির্বাচন করতে চান তা নির্ধারণ করুন।
          </DialogDescription>
        </DialogHeader>

        {/* Primary Question Info Pill */}
        <div className="bg-muted/40 border rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              মূল প্রশ্ন: {masterNumber ? `${toBengaliDigits(masterNumber)}। ` : ""}
              {CATEGORY_OPTIONS.find((c) => c.code === primaryQuestionType)?.nameBn || primaryQuestionType}
            </span>
          </div>
          {primaryMarks !== undefined && primaryMarks !== null && (
            <Badge variant="outline" className="font-bold text-xs bg-background">
              মান: {toBengaliDigits(primaryMarks)}
            </Badge>
          )}
        </div>

        <div className="space-y-4 my-2">
          {/* Question Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              বিকল্প প্রশ্নের ধরন (Question Type):
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {CATEGORY_OPTIONS.map((opt) => {
                const isSelected = selectedCategory === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => setSelectedCategory(opt.code)}
                    className={`flex items-start justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {opt.nameBn}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {opt.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <Badge className="text-[10px] py-0 px-1.5 bg-primary text-primary-foreground">
                        নির্বাচিত
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connector Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              সংযোগকারী লেবেল (Connector Label):
            </label>
            <div className="flex gap-2 items-center">
              <Input
                value={orLabel}
                onChange={(e) => setOrLabel(e.target.value)}
                placeholder="অথবা"
                className="h-8 text-xs font-bold w-32 text-center"
              />
              <div className="flex gap-1">
                {["অথবা", "বা", "OR"].map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={orLabel === l ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 text-xs px-2.5 font-bold"
                    onClick={() => setOrLabel(l)}
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-3 pt-3 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            বাতিল
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleProceedToPicker}
            className="text-xs font-bold gap-1.5"
          >
            <span>গ্রিড ভিউতে প্রশ্ন নির্বাচন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
