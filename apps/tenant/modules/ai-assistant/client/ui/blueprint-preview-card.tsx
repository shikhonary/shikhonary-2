"use client";

import React, { useState } from "react";
import { ClipboardList, Clock, Award, BookOpen, Check, X, Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useAssistant } from "../assistant-provider";

interface DistributionItem {
  serial?: number;
  questionTypeName: string;
  questionCount: number;
  marksPerQuestion: number;
  defaultMarks?: number;
  questionsToAttempt?: number | null;
  totalMarks: number;
}

interface SubjectItem {
  subjectName: string;
  subjectTotal?: number;
  distributions: DistributionItem[];
}

interface BlueprintPreviewProps {
  output: {
    className?: string;
    examName?: string;
    timeInMinutes?: number;
    totalMarks?: number;
    subjects?: SubjectItem[];
    message?: string;
  };
}

export const BlueprintPreviewCard: React.FC<BlueprintPreviewProps> = ({ output }) => {
  const { sendMessage, isLoading } = useAssistant();
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");

  const handleConfirm = () => {
    setStatus("confirmed");
    sendMessage({ text: "হ্যাঁ, এই ব্লুপ্রিন্ট ও নম্বর বণ্টন অনুযায়ী প্রশ্নপত্রটি তৈরি করো।" });
  };

  const handleCancel = () => {
    setStatus("cancelled");
    sendMessage({ text: "না, এটি বাতিল করো।" });
  };

  const { className, examName, timeInMinutes, totalMarks, subjects = [] } = output;

  return (
    <div className="mt-2.5 w-full rounded-xl border border-primary/20 bg-card text-card-foreground p-4 text-xs shadow-sm space-y-3 font-sans">
      {/* Header & Overview */}
      <div className="flex items-center justify-between border-b pb-2.5">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <ClipboardList className="w-4 h-4 text-primary" />
          <span>প্রশ্নপত্রের বিবরণ ও ব্লুপ্রিন্ট সারসংক্ষেপ</span>
        </div>
        {totalMarks !== undefined && (
          <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary border-primary/20">
            মোট নম্বর: {totalMarks}
          </Badge>
        )}
      </div>

      {/* Meta chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50 text-[11px]">
        {className && (
          <div>
            <span className="font-medium text-foreground block">শ্রেণি:</span>
            <span>{className}</span>
          </div>
        )}
        {examName && (
          <div>
            <span className="font-medium text-foreground block">পরীক্ষা:</span>
            <span className="truncate block">{examName}</span>
          </div>
        )}
        {timeInMinutes && (
          <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium text-foreground block">সময়:</span>
              <span>{timeInMinutes} মিনিট</span>
            </div>
          </div>
        )}
      </div>

      {/* Subject Wise Question Types Serialized List */}
      <div className="space-y-3 pt-1">
        <div className="font-medium text-foreground flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>বিষয়ভিত্তিক প্রশ্ন টাইপ ও নম্বর বণ্টন:</span>
        </div>

        {subjects.map((sub, sIdx) => (
          <div key={sIdx} className="space-y-1.5 rounded-lg border bg-muted/20 p-2.5">
            <div className="flex items-center justify-between font-semibold text-foreground text-xs pb-1 border-b border-border/40">
              <span>{sub.subjectName}</span>
              {sub.subjectTotal !== undefined && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  মোট: <strong className="text-foreground">{sub.subjectTotal}</strong> নম্বর
                </span>
              )}
            </div>

            {/* Serialized breakdown */}
            <div className="divide-y divide-border/30">
              {sub.distributions.map((dist, dIdx) => (
                <div
                  key={dIdx}
                  className="py-1.5 flex items-center justify-between text-[11px] text-foreground/90 gap-2"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      {dist.serial || dIdx + 1}
                    </span>
                    <span className="font-medium truncate">{dist.questionTypeName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground shrink-0">
                    <span>
                      {dist.questionCount}টি প্রশ্ন{" "}
                      <span className="text-foreground/70">
                        (প্রতিটি {dist.marksPerQuestion || dist.defaultMarks || 1} নম্বর)
                      </span>
                    </span>
                    {dist.questionsToAttempt && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        [{dist.questionsToAttempt}টির উত্তর]
                      </span>
                    )}
                    <span className="font-semibold text-foreground min-w-[40px] text-right">
                      {dist.totalMarks} নম্বর
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Actions */}
      <div className="pt-2 border-t flex items-center justify-between">
        {status === "pending" ? (
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={handleCancel}
              className="h-8 text-xs cursor-pointer px-3 gap-1"
            >
              <X className="w-3.5 h-3.5" />
              বাতিল
            </Button>

            <Button
              size="sm"
              variant="default"
              disabled={isLoading}
              onClick={handleConfirm}
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer px-4 gap-1.5 font-medium shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              হ্যাঁ, তৈরি করো
            </Button>
          </div>
        ) : status === "confirmed" ? (
          <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 py-1">
            <Check className="w-4 h-4" />
            প্রশ্নপত্র তৈরির নির্দেশ পাঠানো হয়েছে...
          </div>
        ) : (
          <div className="text-muted-foreground font-medium flex items-center gap-1.5 py-1">
            <X className="w-4 h-4" />
            অনুরোধটি বাতিল করা হয়েছে।
          </div>
        )}
      </div>
    </div>
  );
};
