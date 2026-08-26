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
import { useBuilderStore } from "../../../store/use-builder-store";
import { useGeneratePaperSets } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import { Loader2 } from "lucide-react";

interface GenerateSetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalPaperTitle: string;
  originalPaper: any;
}

const SET_CODES = ["ক", "খ", "গ", "ঘ"];

export const GenerateSetsModal: React.FC<GenerateSetsModalProps> = ({
  open,
  onOpenChange,
  originalPaperTitle,
}) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const { mutateAsync: generateSets, isPending: isGenerating } = useGeneratePaperSets();
  const [numSets, setNumSets] = useState(4);

  const handleGenerate = async () => {
    if (!paperId) return;
    try {
      const setCodes = SET_CODES.slice(0, numSets);
      await generateSets({
        sourcePaperId: paperId,
        setCodes,
        shuffleQuestions: true,
        shuffleOptions: true,
      });

      toast.success(`${numSets}টি সেট সফলভাবে তৈরি করা হয়েছে!`);
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "সেট তৈরি করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-display">
        <DialogHeader>
          <DialogTitle>প্রশ্নপত্রের একাধিক সেট তৈরি করুন</DialogTitle>
          <DialogDescription className="font-body text-xs sm:text-sm">
            একই প্রশ্নপত্র থেকে প্রশ্ন ও বিকল্পগুলোর ক্রম এলোমেলো (Shuffle) করে নতুন সেট (যেমন: ক, খ, গ, ঘ) তৈরি করা হবে।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 font-display">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-on-surface">কয়টি সেট তৈরি করতে চান?</label>
            <div className="flex gap-2">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumSets(num)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors cursor-pointer
                    ${numSets === num ? "bg-primary text-white border-primary shadow-sm" : "bg-card hover:bg-muted text-on-surface"}`}
                >
                  {num} টি সেট
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3 text-xs font-body">
            <p className="font-bold text-on-surface mb-2 font-display">তৈরি হতে যাওয়া সেট কোডসমূহ:</p>
            <div className="flex gap-2">
              {SET_CODES.slice(0, numSets).map((code) => (
                <span key={code} className="px-3 py-1 bg-white border border-outline-variant font-bold text-primary rounded-md shadow-xs">
                  সেট {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="font-display gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating} className="cursor-pointer">
            বাতিল
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-primary text-white cursor-pointer font-bold gap-2">
            {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            {numSets} টি সেট তৈরি করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
