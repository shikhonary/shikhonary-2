"use client";

import React, { useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Search, Loader2, Plus, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { 
  useQuestionPaperById, 
  useQuestionPaperDistributionStatuses,
  useAvailableQuestions,
  useBulkAssignQuestions
} from "@/modules/question-paper/services/use-question-paper";
import { RenderMath } from "@workspace/ui/components/render-math";
import { toast } from "@workspace/ui/components/sonner";
import { QUESTION_TYPES, QUESTION_TYPE_CODES, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils";
import Link from "next/link";

export const QuestionPickerPanel: React.FC = () => {
  const paperId = useBuilderStore((state) => state.paperId);
  const { data: paperQuery } = useQuestionPaperById(paperId || "");
  const { data: statuses, isLoading: statusesLoading } = useQuestionPaperDistributionStatuses(paperId || "");
  
  const [selectedDistId, setSelectedDistId] = useState<string>("");
  const [search, setSearch] = useState("");

  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);

  const activeDist = statuses?.find((s: any) => {
    if (selectedDistId) return s.distributionId === selectedDistId;
    if (activeSubSectionId) return s.subSectionId === activeSubSectionId;
    if (activeSectionId) return s.sectionId === activeSectionId;
    return false;
  }) || statuses?.find((s: any) => s.distributionId === selectedDistId) || statuses?.[0];
  const activeDistId = activeDist?.distributionId || "";

  const qTypeNameEn = (activeDist?.questionType?.nameEn || activeDist?.questionTypeName || "").toLowerCase();
  const qTypeNameBn = (activeDist?.questionType?.nameBn || "").toLowerCase();
  const qTypeCode = (activeDist?.questionType?.code || "").toLowerCase();
  const qTypeLabel = (activeDist?.questionTypeLabel || "").toLowerCase();
  const combinedStr = `${qTypeNameEn} ${qTypeNameBn} ${qTypeCode} ${qTypeLabel}`.toLowerCase();

  const rawName = activeDist?.questionTypeName || activeDist?.questionType?.nameEn || activeDist?.questionType?.nameBn || activeDist?.questionTypeLabel || "";
  const normalized = normalizeQuestionTypeName(rawName) || normalizeQuestionTypeName(activeDist?.questionType?.nameEn) || normalizeQuestionTypeName(activeDist?.questionType?.nameBn);

  let category: QuestionTypeCode = QUESTION_TYPE_CODES.MCQ;
  if (normalized === QUESTION_TYPES.CS) {
    category = QUESTION_TYPE_CODES.CS;
  } else if (normalized === QUESTION_TYPES.CQ) {
    category = QUESTION_TYPE_CODES.CQ;
  } else if (normalized === QUESTION_TYPES.SA) {
    category = QUESTION_TYPE_CODES.SA;
  } else if (normalized === QUESTION_TYPES.PARAGRAPH) {
    category = QUESTION_TYPE_CODES.PARAGRAPH;
  } else if (normalized === QUESTION_TYPES.THOUGHT_EXPANSION) {
    category = QUESTION_TYPE_CODES.AMPLIFICATION;
  } else if (normalized === QUESTION_TYPES.MCQ) {
    category = QUESTION_TYPE_CODES.MCQ;
  }

  const { data: availableData, isLoading: questionsLoading } = useAvailableQuestions(
    {
      subjectId: activeDist?.subjectId || "",
      questionTypeId: activeDist?.questionTypeId,
      category,
      search: search.trim() || undefined,
      excludePaperId: paperId || undefined,
      limit: 25,
    },
    Boolean(activeDist?.subjectId)
  );

  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const dismissedSubSectionIds = useBuilderStore((state) => state.dismissedSubSectionIds);

  const allSubSections = React.useMemo(() => {
    if (!paperQuery?.sections) return [];
    const list: { id: string; title: string; titleBn: string | null; sectionId: string }[] = [];
    paperQuery.sections.forEach((sec: any) => {
      if (sec.subSections && sec.subSections.length > 0) {
        sec.subSections.forEach((sub: any) => {
          if (!dismissedSubSectionIds.includes(sub.id)) {
            list.push({
              id: sub.id,
              title: sub.title,
              titleBn: sub.titleBn,
              sectionId: sec.id,
            });
          }
        });
      }
    });
    return list;
  }, [paperQuery?.sections, dismissedSubSectionIds]);

  const currentSubIndex = allSubSections.findIndex((sub) => sub.id === activeSubSectionId);
  const currentSub = currentSubIndex !== -1 ? allSubSections[currentSubIndex] : null;
  const nextSub = currentSubIndex !== -1 && currentSubIndex < allSubSections.length - 1 
    ? allSubSections[currentSubIndex + 1] 
    : (currentSubIndex === -1 && allSubSections.length > 0 ? allSubSections[0] : null);

  const { mutateAsync: assignQuestion, isPending: isAssigning } = useBulkAssignQuestions();

  const handleQuickAssign = async (questionId: string) => {
    if (!paperId || !activeDistId) return;
    try {
      const payloadBase = {
        questionPaperId: paperId,
        distributionId: activeDistId,
        sectionId: activeSectionId || (activeDist as any)?.sectionId || undefined,
        subSectionId: activeSubSectionId || (activeDist as any)?.subSectionId || undefined,
      };

      if (category === "SA") {
        await assignQuestion({ ...payloadBase, shortAnswerIds: [questionId] });
      } else if (category === "CQ") {
        await assignQuestion({ ...payloadBase, cqIds: [questionId] });
      } else if (category === "CS") {
        await assignQuestion({ ...payloadBase, csIds: [questionId] });
      } else if (category === "PARAGRAPH") {
        await assignQuestion({ ...payloadBase, paragraphIds: [questionId] });
      } else if (category === "AMPLIFICATION") {
        await assignQuestion({ ...payloadBase, amplificationIds: [questionId] });
      } else {
        await assignQuestion({ ...payloadBase, mcqIds: [questionId] });
      }

      toast.success("প্রশ্নটি প্রশ্নপত্রে যোগ করা হয়েছে!");
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্ন যোগ করতে ব্যর্থ হয়েছে");
    }
  };

  const questions = availableData?.items || [];

  return (
    <div className="flex flex-col h-full bg-background relative font-display">
      {/* Distribution selector & search bar */}
      <div className="p-3 border-b space-y-2 bg-card">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-on-surface">বণ্টন নির্বাচন করুন:</label>
          {paperId && activeDistId && (
            <Link
              href={`/question-papers/${paperId}/distributions/${activeDistId}/pick`}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>গ্রিড ভিউ</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {statusesLoading ? (
          <div className="h-8 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {statuses?.map((st: any) => {
              const isSelected = (selectedDistId || statuses[0]?.distributionId) === st.distributionId;
              const isComplete = st.addedCount >= st.targetCount && st.targetCount > 0;

              return (
                <button
                  key={st.distributionId}
                  type="button"
                  onClick={() => setSelectedDistId(st.distributionId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-outline-variant"
                  }`}
                >
                  <span>{st.questionTypeName || st.subjectName}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : isComplete ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-muted text-muted-foreground"}`}>
                    {st.addedCount}/{st.targetCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Sub-section Banner & Next Button */}
        {allSubSections.length > 0 && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-primary shrink-0">উপ-বিভাগ:</span>
              <span className="truncate font-medium text-foreground">
                {currentSub ? (currentSub.titleBn || currentSub.title) : "সকল / নির্বাচিত নয়"}
              </span>
            </div>
            {nextSub && (
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => setActiveTarget({ sectionId: nextSub.sectionId, subSectionId: nextSub.id })}
                className="h-6 text-[10px] px-2 bg-primary text-white hover:bg-primary/95 font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                title={`পরবর্তী উপ-বিভাগ: ${nextSub.titleBn || nextSub.title}`}
              >
                <span>পরবর্তী</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="প্রশ্ন খুঁজুন..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs font-body" 
          />
        </div>
      </div>

      {/* Available questions list */}
      <ScrollArea className="flex-1 p-3">
        {questionsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-xs">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs font-body">
            কোনো প্রশ্ন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q: any) => {
              const isAssigned = q.isAssigned;
              const combinedContext = q.type === "COMBINED" && Array.isArray(q.attachments)
                ? q.attachments.find((att: any) => att.caption)?.caption
                : null;

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border transition-all text-xs font-display relative ${
                    isAssigned 
                      ? "bg-muted/30 border-muted opacity-60" 
                      : "bg-card border-outline-variant hover:border-primary/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap gap-1">
                      {q.chapter && (
                        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                          {q.chapter?.nameBn || q.chapter?.nameEn}
                        </Badge>
                      )}
                      {q.type && (
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                          {q.type === "SINGLE" ? "সাধারণ" : q.type === "MULTIPLE" ? "বহুপদি" : q.type === "COMBINED" ? "অভিন্ন" : q.type}
                        </Badge>
                      )}
                    </div>
                    {isAssigned ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> যোগকৃত
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isAssigning}
                        onClick={() => handleQuickAssign(q.id)}
                        className="h-6 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10 rounded-md font-bold cursor-pointer shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>যোগ</span>
                      </Button>
                    )}
                  </div>

                  {/* Context for Combined MCQ */}
                  {category !== "CQ" && combinedContext && (
                    <div className="text-[11px] text-on-surface-variant bg-muted/40 p-2 rounded-lg whitespace-pre-wrap border border-outline-variant/60 mb-2 leading-relaxed font-body">
                      <RenderMath text={combinedContext} />
                    </div>
                  )}

                  <div className="font-body text-on-surface line-clamp-3 leading-relaxed mb-2">
                    {category === "CQ" || category === "CS" ? (
                      <RenderMath text={q.questionA || q.context || "সৃজনশীল প্রশ্ন"} />
                    ) : category === "PARAGRAPH" ? (
                      <RenderMath text={q.name || ""} />
                    ) : category === "AMPLIFICATION" ? (
                      <RenderMath text={q.title || ""} />
                    ) : (
                      <RenderMath text={q.question || ""} />
                    )}
                  </div>

                  {/* Attachments */}
                  {Array.isArray(q.attachments) && q.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.attachments.map((att: any, attIdx: number) => {
                        const isImage = att.type === "image" || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(att.url);
                        if (isImage && att.url !== "text-context") {
                          return (
                            <div key={attIdx} className="space-y-1">
                              <img
                                src={att.url}
                                alt={att.caption || "Attachment"}
                                className="max-h-24 rounded-lg border border-outline-variant/60 object-contain bg-muted/20"
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* References */}
                  {Array.isArray(q.reference) && q.reference.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 border-t border-outline-variant/30 pt-2">
                      {q.reference.map((ref: string, rIdx: number) => (
                        <span key={rIdx} className="px-1.5 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground">
                          🏷️ {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
