"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useAvailableQuestions } from "@/modules/question-paper/services/use-question-paper";
import { McqPickerCard } from "./mcq-picker-card";
import { CqPickerCard } from "./cq-picker-card";
import { CsPickerCard } from "./cs-picker-card";
import { SaPickerCard } from "./sa-picker-card";
import { ParagraphPickerCard } from "./paragraph-picker-card";
import { AmplificationPickerCard } from "./amplification-picker-card";

export interface QuestionGridProps {
  subjectId: string;
  questionTypeId: string;
  category: "MCQ" | "CQ" | "CS" | "SA" | "PARAGRAPH" | "AMPLIFICATION";
  search: string;
  chapterId: string;
  board: string;
  excludePaperId: string;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const QuestionGrid: React.FC<QuestionGridProps> = ({
  subjectId,
  questionTypeId,
  category,
  search,
  chapterId,
  board,
  excludePaperId,
  selectedIds,
  onToggle,
}) => {
  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    questionTypeId,
    category,
    search: search.trim() || undefined,
    chapterId: chapterId !== "All" ? chapterId : undefined,
    board: board !== "All" ? board : undefined,
    excludePaperId,
    limit: 50,
  });

  const questions = result?.items || [];

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground bg-card border rounded-2xl p-8 font-body">
        কোনো প্রশ্ন পাওয়া যায়নি। অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করুন।
      </div>
    );
  }

  const renderCard = (q: any) => {
    const isSelected = selectedIds.includes(q.id);

    switch (category) {
      case "CQ":
        return <CqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "CS":
        return <CsPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "SA":
        return <SaPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "PARAGRAPH":
        return <ParagraphPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "AMPLIFICATION":
        return <AmplificationPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
      case "MCQ":
      default:
        return <McqPickerCard key={q.id} question={q} isSelected={isSelected} onToggle={onToggle} />;
    }
  };

  return (
    <div
      className={`grid gap-4 ${
        category === "CQ"
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {questions.map((q: any) => renderCard(q))}
    </div>
  );
};
