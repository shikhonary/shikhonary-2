"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useAssistant } from "../assistant-provider";

interface ApprovalCardProps {
  actionSummary: string;
  actionType?: string;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  actionSummary,
}) => {
  const { sendMessage, isLoading } = useAssistant();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const handleApprove = () => {
    setStatus("approved");
    sendMessage({ text: "হ্যাঁ, আমি নিশ্চিত। অনুমোদন করছি, কাজটি সম্পন্ন করুন।" });
  };

  const handleReject = () => {
    setStatus("rejected");
    sendMessage({ text: "না, এটি বাতিল করুন।" });
  };

  return (
    <div className="mt-2.5 rounded-xl border border-amber-300/80 bg-amber-50/90 dark:border-amber-800/60 dark:bg-amber-950/40 p-3.5 text-xs shadow-xs space-y-2.5">
      <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 font-medium leading-relaxed">
          {actionSummary}
        </div>
      </div>

      {status === "pending" ? (
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="default"
            disabled={isLoading}
            onClick={handleApprove}
            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer px-3 gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            অনুমোদন করুন
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={handleReject}
            className="h-7 text-xs cursor-pointer px-3 gap-1 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            <X className="w-3.5 h-3.5" />
            বাতিল
          </Button>
        </div>
      ) : status === "approved" ? (
        <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
          <Check className="w-3.5 h-3.5" />
          আপনি কাজটি অনুমোদন করেছেন। সম্পাদন হচ্ছে...
        </div>
      ) : (
        <div className="text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
          <X className="w-3.5 h-3.5" />
          অনুরোধটি বাতিল করা হয়েছে।
        </div>
      )}
    </div>
  );
};
