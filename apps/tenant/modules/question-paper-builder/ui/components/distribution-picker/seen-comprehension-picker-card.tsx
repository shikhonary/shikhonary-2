"use client";

import React, { useState, useMemo } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { PickerCardWrapper } from "./picker-card-wrapper";
import { Badge } from "@workspace/ui/components/badge";
import { ChevronDown, ChevronUp, CheckSquare, Square, Layers, ListFilter } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface SeenComprehensionPickerCardProps {
  question: any;
  isSelected: boolean;
  selectedSubQuestionIds?: string[];
  onToggle: (id: string) => void;
  onToggleSubQuestion?: (passageId: string, subQuestionId: string, allSubIds: string[]) => void;
  onSelectGroup?: (passageId: string, groupSubIds: string[], allSubIds: string[]) => void;
}

export const SeenComprehensionPickerCard: React.FC<SeenComprehensionPickerCardProps> = ({
  question: q,
  isSelected,
  selectedSubQuestionIds = [],
  onToggle,
  onToggleSubQuestion,
  onSelectGroup,
}) => {
  const [expandedPassage, setExpandedPassage] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState(false);

  const chapterName =
    q.academicChapter?.nameEn ||
    q.chapter?.nameEn ||
    q.academicChapter?.nameBn ||
    q.chapter?.nameBn;

  const defaultTypeLabel =
    q.comprehensionType === "SEEN_COMPREHENSION_2"
      ? "Seen Comprehension 2"
      : "Seen Comprehension 1";

  const typeLabel =
    q.questionType?.nameEn ||
    defaultTypeLabel;

  const questions: any[] = Array.isArray(q.questions) ? q.questions : [];
  const allSubIds = useMemo(() => questions.map((sq) => sq.id), [questions]);
  const assignedSubIds: string[] = Array.isArray(q.assignedSubQuestionIds) ? q.assignedSubQuestionIds : [];

  // Group sub-questions
  const groupedQuestions = useMemo(() => {
    return questions.reduce((acc: Record<number, any[]>, sq: any) => {
      const g = sq.groupNumber || 1;
      if (!acc[g]) acc[g] = [];
      acc[g].push(sq);
      return acc;
    }, {});
  }, [questions]);

  const groupKeys = Object.keys(groupedQuestions).map(Number).sort((a, b) => a - b);

  // Active selected IDs for this card
  const activeSelectedIds = useMemo(() => {
    if (!isSelected) return [];
    if (selectedSubQuestionIds.length === 0) return allSubIds;
    return selectedSubQuestionIds;
  }, [isSelected, selectedSubQuestionIds, allSubIds]);

  const isSubSelected = (subId: string) => activeSelectedIds.includes(subId);

  // Calculate total marks of currently selected questions
  const selectedMarks = useMemo(() => {
    if (!isSelected) return 0;
    return questions
      .filter((sq) => activeSelectedIds.includes(sq.id))
      .reduce((sum, sq) => sum + (sq.marks || 1), 0);
  }, [isSelected, questions, activeSelectedIds]);

  const handleSubToggle = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    if (onToggleSubQuestion) {
      onToggleSubQuestion(q.id, subId, allSubIds);
    } else {
      onToggle(q.id);
    }
  };

  const handleGroupSelect = (e: React.MouseEvent, groupItems: any[]) => {
    e.stopPropagation();
    setExpandedQuestions(true);
    const groupSubIds = groupItems.map((sq) => sq.id);
    if (onSelectGroup) {
      onSelectGroup(q.id, groupSubIds, allSubIds);
    } else {
      onToggle(q.id);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isAllSelected = isSelected && activeSelectedIds.length === allSubIds.length;
    if (isAllSelected) {
      onToggle(q.id);
    } else {
      setExpandedQuestions(true);
      if (onSelectGroup) {
        onSelectGroup(q.id, allSubIds, allSubIds);
      } else {
        onToggle(q.id);
      }
    }
  };

  return (
    <PickerCardWrapper
      id={q.id}
      isAssigned={q.isAssigned}
      isSelected={isSelected}
      onToggle={onToggle}
      chapterName={chapterName}
      typeLabel={typeLabel}
      difficulty={q.difficulty}
      language="en"
      extraBadges={
        assignedSubIds.length > 0 ? (
          <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200">
            {assignedSubIds.length} used in another question
          </Badge>
        ) : null
      }
      footerRight={
        isSelected && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <span>{activeSelectedIds.length} selected</span>
            <span className="text-muted-foreground font-normal">({selectedMarks} marks)</span>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-2.5 font-body">
        {q.title && (
          <div className="font-bold text-xs text-primary font-headline">
            <RenderMath text={q.title} />
          </div>
        )}

        {/* Reading Passage preview */}
        {q.passage && (
          <div className="text-xs bg-muted/30 p-2.5 rounded-lg border border-outline-variant/40 text-muted-foreground leading-relaxed relative">
            <div className={cn(!expandedPassage && "line-clamp-3")}>
              <RenderMath text={q.passage} />
            </div>
            {q.passage.length > 150 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedPassage((prev) => !prev);
                }}
                className="mt-1 text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                {expandedPassage ? "Show less" : "Read full passage"}
                {expandedPassage ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        )}

        {/* Sub-Questions Selection Toolbar */}
        {questions.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 border-t border-dashed border-outline-variant/60 pt-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-semibold text-foreground/80 flex items-center gap-1 text-[11px]">
                <ListFilter className="w-3.5 h-3.5 text-primary" />
                Sub-questions ({questions.length}):
              </span>

              {/* Quick Group Select Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {groupKeys.length > 1 &&
                  groupKeys.map((gNum) => {
                    const gItems = groupedQuestions[gNum] || [];
                    const gSubIds = gItems.map((sq) => sq.id);
                    const isAllGSelected =
                      isSelected &&
                      gSubIds.length > 0 &&
                      gSubIds.every((id) => activeSelectedIds.includes(id));
                    const isPartiallyGSelected =
                      isSelected &&
                      !isAllGSelected &&
                      gSubIds.some((id) => activeSelectedIds.includes(id));

                    return (
                      <button
                        key={gNum}
                        type="button"
                        onClick={(e) => handleGroupSelect(e, gItems)}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer flex items-center gap-1",
                          isAllGSelected
                            ? "bg-primary text-white border-primary shadow-2xs"
                            : isPartiallyGSelected
                              ? "bg-primary/10 text-primary border-primary/40 font-semibold"
                              : "bg-muted/50 hover:bg-muted text-foreground/80 border-border"
                        )}
                        title={`Toggle Group ${gNum}`}
                      >
                        <Layers className="w-2.5 h-2.5" />
                        Group {gNum} ({gItems.length})
                      </button>
                    );
                  })}

                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer",
                    isSelected && activeSelectedIds.length === allSubIds.length
                      ? "bg-primary text-white border-primary shadow-2xs"
                      : "bg-muted/50 hover:bg-muted text-foreground/80 border-border"
                  )}
                  title="Select / deselect all questions"
                >
                  All ({questions.length})
                </button>
              </div>
            </div>

            {/* List of sub-questions grouped by group */}
            <div className="space-y-2 mt-1">
              {groupKeys.map((gNum, gIdx) => {
                const gItems = groupedQuestions[gNum] || [];
                const gSubIds = gItems.map((sq) => sq.id);
                const isAllGSelected =
                  isSelected &&
                  gSubIds.length > 0 &&
                  gSubIds.every((id) => activeSelectedIds.includes(id));
                const isPartiallyGSelected =
                  isSelected &&
                  !isAllGSelected &&
                  gSubIds.some((id) => activeSelectedIds.includes(id));

                const firstItem = gItems[0];
                const isMcq =
                  firstItem?.type === "MCQ" || gItems.some((sq) => sq.type === "MCQ");
                const isTf =
                  firstItem?.type === "TRUE_FALSE" ||
                  gItems.some((sq) => sq.type === "TRUE_FALSE");

                let defaultTitle = "Answer the following questions:";
                if (isMcq) {
                  defaultTitle = "Choose the correct answer from the following alternatives:";
                } else if (isTf) {
                  defaultTitle = "Write 'True' for correct statement and 'False' for incorrect statement.";
                }

                let rawTitle = firstItem?.groupTitle || defaultTitle;
                if (
                  isTf &&
                  (!firstItem?.groupTitle ||
                    firstItem.groupTitle.toLowerCase().includes("write whether the following statements are true or false"))
                ) {
                  rawTitle = "Write 'True' for correct statement and 'False' for incorrect statement.";
                }
                const cleanTitle = rawTitle.replace(/^\d+[\.\)\s]+/, "").trim();

                const groupTotalMarks = gItems.reduce(
                  (sum, sq) => sum + (sq.marks || 1),
                  0
                );

                const isGroupExpanded = expandedQuestions || isSelected || gIdx === 0;
                const visibleItems = isGroupExpanded ? gItems : gItems.slice(0, 1);

                return (
                  <div
                    key={gNum}
                    className="flex flex-col gap-1.5 p-2 rounded-xl border border-border/70 bg-muted/20"
                  >
                    {/* Group Header with toggle */}
                    <div
                      onClick={(e) => handleGroupSelect(e, gItems)}
                      className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-muted/50 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="shrink-0 text-primary">
                          {isAllGSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary fill-primary/10" />
                          ) : isPartiallyGSelected ? (
                            <div className="w-4 h-4 rounded-[4px] border border-primary bg-primary/20 flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary rounded-xs" />
                            </div>
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>

                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 font-bold shrink-0 transition-colors",
                            isAllGSelected
                              ? "bg-primary text-white"
                              : "bg-muted text-foreground/80 border-border"
                          )}
                        >
                          Group {gNum}
                        </Badge>

                        <span className="text-xs font-semibold text-foreground/90 truncate">
                          {cleanTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isTf && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                            True/False
                          </span>
                        )}
                        {isMcq && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                            MCQ
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium">
                          ({gItems.length} questions, {groupTotalMarks} marks)
                        </span>
                      </div>
                    </div>

                    {/* Sub-questions of this group */}
                    <div className="space-y-1 pl-1">
                      {visibleItems.map((sq: any, sIdx: number) => {
                        const label = sq.itemLabel || String.fromCharCode(97 + sIdx);
                        const checked = isSubSelected(sq.id);
                        const isAssignedElsewhere = assignedSubIds.includes(sq.id);

                        return (
                          <div
                            key={sq.id || sIdx}
                            onClick={(e) => handleSubToggle(e, sq.id)}
                            className={cn(
                              "flex items-start justify-between gap-2 p-1.5 rounded-lg border text-xs transition-colors cursor-pointer",
                              checked
                                ? "bg-primary/[0.04] border-primary/40 text-foreground"
                                : "bg-card/40 border-border/40 hover:bg-muted/30 text-muted-foreground"
                            )}
                          >
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <div className="mt-0.5 shrink-0 text-primary">
                                {checked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-primary fill-primary/10" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-primary shrink-0">
                                    ({label})
                                  </span>
                                  <span className="line-clamp-2 text-foreground/90 font-medium">
                                    <RenderMath text={sq.question} />
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isAssignedElsewhere && (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1 py-0.2 rounded font-medium">
                                  Used
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {questions.length > 3 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedQuestions((prev) => !prev);
                  }}
                  className="w-full text-center py-1 text-[11px] text-primary hover:underline font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  {expandedQuestions
                    ? "Collapse questions"
                    : `+ View all questions (${questions.length} questions)`}
                  {expandedQuestions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PickerCardWrapper>
  );
};
