"use client";

import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import {
  useReorderQuestions,
  useSwapAlternativeQuestion,
} from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowLeftRight, Loader2 } from "lucide-react";

export interface QuestionPositionControlProps {
  paperId?: string | null;
  questionPaperQuestionId: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  siblingQuestions?: Array<{ id: string; orderIndex: number }>;
  alternatives?: Array<{ id: string; questionType?: string; orLabel?: string }>;
  isSubQuestion?: boolean;
  className?: string;
  showText?: boolean;
}

export const QuestionPositionControl: React.FC<QuestionPositionControlProps> = ({
  paperId,
  questionPaperQuestionId,
  canMoveUp = false,
  canMoveDown = false,
  siblingQuestions,
  alternatives = [],
  isSubQuestion = false,
  className = "",
  showText = false,
}) => {
  const storePaperId = useBuilderStore((state) => state.paperId);
  const isPublished = useBuilderStore((state) => state.isPublished);
  const effectivePaperId = paperId || storePaperId || "";

  if (isPublished) return null;

  const { mutateAsync: reorderQuestions, isPending: isReordering } = useReorderQuestions();
  const { mutateAsync: swapAlternative, isPending: isSwapping } = useSwapAlternativeQuestion();

  const isLoading = isReordering || isSwapping;
  const hasAlternatives = Array.isArray(alternatives) && alternatives.length > 0;

  const handleMoveUp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canMoveUp || !siblingQuestions || siblingQuestions.length <= 1 || !effectivePaperId) return;
    const sorted = [...siblingQuestions].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sorted.findIndex((q) => q.id === questionPaperQuestionId);
    if (currentIndex <= 0) return;
    const prevItem = sorted[currentIndex - 1];
    const currentItem = sorted[currentIndex];
    if (!prevItem || !currentItem) return;

    try {
      await reorderQuestions({
        questionPaperId: effectivePaperId,
        questionOrders: [
          { id: questionPaperQuestionId, orderIndex: prevItem.orderIndex },
          { id: prevItem.id, orderIndex: currentItem.orderIndex },
        ],
      });
      toast.success(isSubQuestion ? "উপ-প্রশ্ন উপরে স্থানান্তর করা হয়েছে" : "প্রশ্ন উপরে স্থানান্তর করা হয়েছে");

      useBuilderStore.getState().pushHistoryEntry({
        description: isSubQuestion ? "উপ-প্রশ্ন উপরে স্থানান্তর" : "প্রশ্ন উপরে স্থানান্তর",
        undo: async () => {
          await reorderQuestions({
            questionPaperId: effectivePaperId,
            questionOrders: [
              { id: questionPaperQuestionId, orderIndex: currentItem.orderIndex },
              { id: prevItem.id, orderIndex: prevItem.orderIndex },
            ],
          });
        },
        redo: async () => {
          await reorderQuestions({
            questionPaperId: effectivePaperId,
            questionOrders: [
              { id: questionPaperQuestionId, orderIndex: prevItem.orderIndex },
              { id: prevItem.id, orderIndex: currentItem.orderIndex },
            ],
          });
        },
      });
    } catch (err: any) {
      toast.error(err?.message || "স্থানান্তর করা যায়নি");
    }
  };

  const handleMoveDown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canMoveDown || !siblingQuestions || siblingQuestions.length <= 1 || !effectivePaperId) return;
    const sorted = [...siblingQuestions].sort((a, b) => a.orderIndex - b.orderIndex);
    const currentIndex = sorted.findIndex((q) => q.id === questionPaperQuestionId);
    if (currentIndex < 0 || currentIndex >= sorted.length - 1) return;
    const nextItem = sorted[currentIndex + 1];
    const currentItem = sorted[currentIndex];
    if (!nextItem || !currentItem) return;

    try {
      await reorderQuestions({
        questionPaperId: effectivePaperId,
        questionOrders: [
          { id: questionPaperQuestionId, orderIndex: nextItem.orderIndex },
          { id: nextItem.id, orderIndex: currentItem.orderIndex },
        ],
      });
      toast.success(isSubQuestion ? "উপ-প্রশ্ন নিচে স্থানান্তর করা হয়েছে" : "প্রশ্ন নিচে স্থানান্তর করা হয়েছে");

      useBuilderStore.getState().pushHistoryEntry({
        description: isSubQuestion ? "উপ-প্রশ্ন নিচে স্থানান্তর" : "প্রশ্ন নিচে স্থানান্তর",
        undo: async () => {
          await reorderQuestions({
            questionPaperId: effectivePaperId,
            questionOrders: [
              { id: questionPaperQuestionId, orderIndex: currentItem.orderIndex },
              { id: nextItem.id, orderIndex: nextItem.orderIndex },
            ],
          });
        },
        redo: async () => {
          await reorderQuestions({
            questionPaperId: effectivePaperId,
            questionOrders: [
              { id: questionPaperQuestionId, orderIndex: nextItem.orderIndex },
              { id: nextItem.id, orderIndex: currentItem.orderIndex },
            ],
          });
        },
      });
    } catch (err: any) {
      toast.error(err?.message || "স্থানান্তর করা যায়নি");
    }
  };

  const handleSwapAlternative = async (alternativeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!effectivePaperId) return;
    try {
      await swapAlternative({
        questionPaperId: effectivePaperId,
        parentQuestionId: questionPaperQuestionId,
        alternativeQuestionId: alternativeId,
      });
      toast.success("মূল প্রশ্ন ও বিকল্প প্রশ্নের স্থান অদলবদল করা হয়েছে");

      useBuilderStore.getState().pushHistoryEntry({
        description: "বিকল্প প্রশ্নের সাথে অদলবদল",
        undo: async () => {
          await swapAlternative({
            questionPaperId: effectivePaperId,
            parentQuestionId: questionPaperQuestionId,
            alternativeQuestionId: alternativeId,
          });
        },
        redo: async () => {
          await swapAlternative({
            questionPaperId: effectivePaperId,
            parentQuestionId: questionPaperQuestionId,
            alternativeQuestionId: alternativeId,
          });
        },
      });
    } catch (err: any) {
      toast.error(err?.message || "অদলবদল করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isLoading}
          className={`px-2 py-1 text-xs hover:bg-muted text-foreground/80 hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer select-none ${className}`}
          title={isSubQuestion ? "উপ-প্রশ্নের স্থান পরিবর্তন" : "প্রশ্নের স্থান পরিবর্তন"}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
          ) : (
            <ArrowUpDown className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          )}
          {showText && <span className="font-headline text-[11px]">স্থান</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1 font-headline z-50 text-xs">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground font-semibold px-2 py-1 select-none">
          {isSubQuestion ? "উপ-প্রশ্নের অবস্থান সেটিং" : "প্রশ্নের অবস্থান সেটিং"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        {/* Move Up */}
        <DropdownMenuItem
          disabled={!canMoveUp || isLoading}
          onClick={handleMoveUp}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
            !canMoveUp ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
          <span>{isSubQuestion ? "উপ-প্রশ্ন উপরে নিন (↑)" : "প্রশ্ন উপরে নিন (↑)"}</span>
        </DropdownMenuItem>

        {/* Move Down */}
        <DropdownMenuItem
          disabled={!canMoveDown || isLoading}
          onClick={handleMoveDown}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
            !canMoveDown ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
          <span>{isSubQuestion ? "উপ-প্রশ্ন নিচে নিন (↓)" : "প্রশ্ন নিচে নিন (↓)"}</span>
        </DropdownMenuItem>

        {/* Alternative Question Swapping */}
        {hasAlternatives && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <div className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 select-none">
              বিকল্প প্রশ্নের সাথে অদলবদল:
            </div>
            {alternatives.map((alt, idx) => (
              <DropdownMenuItem
                key={alt.id}
                disabled={isLoading}
                onClick={(e) => handleSwapAlternative(alt.id, e)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {alt.orLabel || `বিকল্প (অথবা) প্রশ্ন ${alternatives.length > 1 ? idx + 1 : ""}`}-এর সাথে বদলান
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
