"use client";

import React, { useState, useMemo } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ArrowUpDown, Trash2, Check, Loader2 } from "lucide-react";
import {
  useRemoveAlternativeQuestion,
  useSwapAlternativeQuestion,
  useUpdateAlternativeQuestion,
  useQuestionPaperById,
} from "@/modules/question-paper/services/use-question-paper";
import { useBuilderStore } from "../../../store/use-builder-store";
import { toast } from "@workspace/ui/components/sonner";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

interface AlternativeQuestionRendererProps {
  paperId: string;
  parentQuestionId: string;
  alternatives: any[];
  settings?: any;
  masterNumber?: number;
  primaryMarks?: number | null;
}

export const AlternativeQuestionRenderer: React.FC<AlternativeQuestionRendererProps> = ({
  paperId,
  parentQuestionId,
  alternatives,
  settings,
  masterNumber,
  primaryMarks,
}) => {
  const { data: paper } = useQuestionPaperById(paperId || "");
  const { mutateAsync: removeAlternative, isPending: isRemoving } = useRemoveAlternativeQuestion();
  const { mutateAsync: swapAlternative, isPending: isSwapping } = useSwapAlternativeQuestion();
  const { mutateAsync: updateAlternative } = useUpdateAlternativeQuestion();

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelValue, setLabelValue] = useState("");

  const allDistributions = useMemo(() => {
    return paper?.subjects?.flatMap((s: any) => s.distributions || []) || [];
  }, [paper]);

  if (!alternatives || alternatives.length === 0) return null;

  const storeSettings = useBuilderStore((state) => state.settings);
  const activeSettings = settings || storeSettings;

  const questionStyle = {
    fontSize: activeSettings?.fontSize,
    fontFamily: activeSettings?.fontFamily,
    lineHeight: activeSettings?.lineHeight,
    fontWeight: activeSettings?.fontWeight || "normal",
  };

  const handleRemove = async (alternativeQuestionId: string) => {
    try {
      await removeAlternative({
        questionPaperId: paperId,
        alternativeQuestionId,
      });
      toast.success("বিকল্প প্রশ্ন মুছে ফেলা হয়েছে");
    } catch (err: any) {
      toast.error(err?.message || "মুছে ফেলতে ব্যর্থ হয়েছে");
    }
  };

  const handleSwap = async (alternativeQuestionId: string) => {
    try {
      await swapAlternative({
        questionPaperId: paperId,
        parentQuestionId,
        alternativeQuestionId,
      });
      toast.success("মূল প্রশ্ন ও বিকল্প প্রশ্নের স্থান পরিবর্তন করা হয়েছে");
    } catch (err: any) {
      toast.error(err?.message || "পরিবর্তন করতে ব্যর্থ হয়েছে");
    }
  };

  const handleSaveLabel = async (alternativeQuestionId: string) => {
    if (!labelValue.trim()) {
      setEditingLabelId(null);
      return;
    }
    try {
      await updateAlternative({
        questionPaperId: paperId,
        alternativeQuestionId,
        orLabel: labelValue.trim(),
      });
      setEditingLabelId(null);
    } catch (err: any) {
      toast.error(err?.message || "লেবেল আপডেট করতে ব্যর্থ হয়েছে");
    }
  };

  const renderNumberSpacer = () => (
    <span
      className="font-bold shrink-0 invisible select-none pointer-events-none"
      style={{
        fontSize: questionStyle.fontSize,
        fontFamily: questionStyle.fontFamily,
      }}
      aria-hidden="true"
    >
      {toBengaliDigits(masterNumber || 1)}।
    </span>
  );

  const renderSubQuestionLabel = (label: string) => {
    const labelStyle = {
      fontSize: questionStyle.fontSize,
      fontFamily: questionStyle.fontFamily,
    };

    switch (activeSettings?.optionStyle) {
      case "dot":
        return <span className="font-bold shrink-0 min-w-[1.6em]" style={labelStyle}>{label}.</span>;
      case "parentheses":
        return <span className="font-bold shrink-0 min-w-[1.6em]" style={labelStyle}>({label})</span>;
      case "round":
        return <span className="font-bold shrink-0 min-w-[1.6em]" style={labelStyle}>{label})</span>;
      case "circle":
        return (
          <div 
            className="font-bold shrink-0 flex items-center justify-center rounded-full border border-black/50 leading-none"
            style={{ 
              width: "1.6em", 
              height: "1.6em", 
              fontSize: `${(questionStyle.fontSize || activeSettings?.fontSize || 13) - 2}px`, 
              marginTop: "2px",
              fontFamily: activeSettings?.fontFamily,
              lineHeight: "1"
            }}
          >
            {label}
          </div>
        );
      default:
        return <span className="font-bold shrink-0 min-w-[1.6em]" style={labelStyle}>({label})</span>;
    }
  };

  return (
    <div className="w-full flex flex-col mt-0.5">
      {alternatives.map((alt) => {
        const cq = alt.cq;
        const sa = alt.shortAnswer;
        const paragraph = alt.paragraph;
        const amplification = alt.amplification;
        const letter = alt.letter;
        const application = alt.application;
        const cs = alt.cs;
        const mcq = alt.mcq;

        return (
          <div key={alt.id} className="w-full flex flex-col group/alt relative">
            {/* ── OR DIVIDER ── */}
            <div className="my-1 flex items-center justify-center gap-2 w-full relative">
              <div className="h-px bg-on-surface/20 flex-1"></div>
              {editingLabelId === alt.id ? (
                <div className="flex items-center gap-1 z-10 print:hidden">
                  <Input
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    className="h-5 w-16 text-[11px] text-center font-bold px-1 py-0"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveLabel(alt.id);
                      if (e.key === "Escape") setEditingLabelId(null);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveLabel(alt.id)}
                    className="h-5 w-5 p-0 text-primary"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditingLabelId(alt.id);
                    setLabelValue(alt.orLabel || "অথবা");
                  }}
                  className="px-2.5 py-0 text-[11px] font-bold bg-background text-foreground border border-on-surface/20 rounded cursor-pointer hover:border-primary transition-colors select-none leading-tight"
                  title="লেবেল সম্পাদনা করতে ক্লিক করুন (যেমন: অথবা, বা, OR)"
                >
                  {alt.orLabel || "অথবা"}
                </div>
              )}
              <div className="h-px bg-on-surface/20 flex-1"></div>
            </div>

            {/* ── ALTERNATIVE QUESTION CONTENT (EXACT BLOCK REPRESENTATION WITH NUMBER ALIGNMENT) ── */}
            <div className="relative rounded-lg hover:bg-muted/15 transition-colors py-0.5 w-full">
              {/* Hover actions */}
              <div className="absolute top-0 right-1 opacity-0 group-hover/alt:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-20 print:hidden text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSwap(alt.id)}
                  disabled={isSwapping}
                  className="px-2 py-0.5 hover:bg-primary/10 text-primary flex items-center gap-1 transition-colors border-r font-medium"
                  title="মূল প্রশ্ন ও বিকল্প প্রশ্ন অদলবদল করুন"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  মূল প্রশ্ন বানান
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(alt.id)}
                  disabled={isRemoving}
                  className="px-2 py-0.5 hover:bg-destructive/10 text-destructive flex items-center gap-1 transition-colors font-medium"
                  title="বিকল্প প্রশ্ন মুছে ফেলুন"
                >
                  {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  মুছুন
                </button>
              </div>

              {/* 1. EXACT PARAGRAPH BLOCK REPRESENTATION */}
              {paragraph && (() => {
                const paragraphDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === paragraph.questionTypeId ||
                      d.questionTypeName?.includes("অনুচ্ছেদ") ||
                      d.questionTypeName?.toLowerCase().includes("paragraph")
                  ) || alt.distribution;

                const rawLabel = paragraphDist?.questionTypeLabel || paragraph.questionType?.label;
                const pLabel = rawLabel?.trim()
                  ? rawLabel.trim().endsWith(":") || rawLabel.trim().endsWith("।") ? rawLabel.trim() : `${rawLabel.trim()}:`
                  : null;
                const marksPerQuestion = alt.assignedMarks ?? paragraphDist?.marksPerQuestion ?? primaryMarks ?? 10;
                const attemptCount = paragraphDist?.questionsToAttempt || paragraphDist?.attemptCount || 1;

                return (
                  <div className="w-full flex flex-col">
                    {/* Header row: Keeps number spacer so label aligns with primary block */}
                    {pLabel && (
                      <div className="flex justify-between items-start w-full mb-0.5">
                        <div
                          className="font-bold ml-[0px] flex items-baseline gap-1"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {renderNumberSpacer()}
                          <span>{pLabel}</span>
                        </div>
                        <div
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(marksPerQuestion)}{" "}
                          <span className="font-sans px-1">×</span>{" "}
                          {toBengaliDigits(attemptCount)} ={" "}
                          {toBengaliDigits(marksPerQuestion * attemptCount)}
                        </div>
                      </div>
                    )}

                    {/* Body: pl-4 with subquestion label (ক) and paragraph name */}
                    <div className={`flex justify-between items-start gap-2 ${pLabel ? "pl-4 mt-0.5" : "w-full"}`}>
                      <div className="flex gap-2 items-start flex-1 min-w-0">
                        {!pLabel && renderNumberSpacer()}
                        {pLabel && renderSubQuestionLabel("ক")}
                        <div className="flex-1 w-full min-w-0">
                          <div
                            className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                              lineHeight: questionStyle.lineHeight,
                            }}
                          >
                            <RenderMath text={paragraph.name || paragraph.title || ""} />
                          </div>
                        </div>
                      </div>
                      {!pLabel && (
                        <span
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(marksPerQuestion)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. EXACT LETTER BLOCK REPRESENTATION */}
              {letter && (() => {
                const letterDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === letter.questionTypeId ||
                      d.questionTypeName?.includes("চিঠি") ||
                      d.questionTypeName?.includes("পত্র") ||
                      d.questionTypeName?.toLowerCase().includes("letter")
                  ) || alt.distribution;

                const mark = alt.assignedMarks ?? letterDist?.marksPerQuestion ?? primaryMarks ?? 10;

                return (
                  <div className="flex justify-between items-start gap-2 w-full">
                    <div className="flex gap-2 items-start flex-1 min-w-0">
                      {renderNumberSpacer()}
                      <div className="flex-1 w-full min-w-0">
                        <div
                          className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                            lineHeight: questionStyle.lineHeight,
                          }}
                        >
                          <RenderMath text={letter.title || letter.name || ""} />
                        </div>
                      </div>
                    </div>
                    {mark !== undefined && mark !== null && (
                      <span
                        className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                        style={{
                          fontSize: questionStyle.fontSize,
                          fontFamily: questionStyle.fontFamily,
                        }}
                      >
                        {toBengaliDigits(mark)}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 3. EXACT APPLICATION BLOCK REPRESENTATION */}
              {application && (() => {
                const appDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === application.questionTypeId ||
                      d.questionTypeName?.includes("আবেদন") ||
                      d.questionTypeName?.includes("দরখাস্ত") ||
                      d.questionTypeName?.toLowerCase().includes("application")
                  ) || alt.distribution;

                const mark = alt.assignedMarks ?? appDist?.marksPerQuestion ?? primaryMarks ?? 10;

                return (
                  <div className="flex justify-between items-start gap-2 w-full">
                    <div className="flex gap-2 items-start flex-1 min-w-0">
                      {renderNumberSpacer()}
                      <div className="flex-1 w-full min-w-0">
                        <div
                          className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                            lineHeight: questionStyle.lineHeight,
                          }}
                        >
                          <RenderMath text={application.title || application.name || ""} />
                        </div>
                      </div>
                    </div>
                    {mark !== undefined && mark !== null && (
                      <span
                        className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                        style={{
                          fontSize: questionStyle.fontSize,
                          fontFamily: questionStyle.fontFamily,
                        }}
                      >
                        {toBengaliDigits(mark)}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* 4. EXACT AMPLIFICATION BLOCK REPRESENTATION */}
              {amplification && (() => {
                const ampDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === amplification.questionTypeId ||
                      d.questionTypeName?.includes("ভাব-সম্প্রসারণ") ||
                      d.questionTypeName?.toLowerCase().includes("amplification")
                  ) || alt.distribution;

                const rawLabel = ampDist?.questionTypeLabel || amplification.questionType?.label;
                const ampLabel = rawLabel?.trim()
                  ? rawLabel.trim().endsWith(":") || rawLabel.trim().endsWith("।") ? rawLabel.trim() : `${rawLabel.trim()}:`
                  : null;
                const mark = alt.assignedMarks ?? ampDist?.marksPerQuestion ?? primaryMarks ?? 10;

                return (
                  <div className="w-full flex flex-col">
                    {ampLabel && (
                      <div className="flex justify-between items-start w-full mb-0.5">
                        <div
                          className="font-bold ml-[0px] flex items-baseline gap-1"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {renderNumberSpacer()}
                          <span>{ampLabel}</span>
                        </div>
                        <div
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(mark)}
                        </div>
                      </div>
                    )}
                    <div className={`flex justify-between items-start gap-2 ${ampLabel ? "pl-4 mt-0.5" : "w-full"}`}>
                      <div className="flex gap-2 items-start flex-1 min-w-0">
                        {!ampLabel && renderNumberSpacer()}
                        <div className="flex-1 w-full min-w-0">
                          <div
                            className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                              lineHeight: questionStyle.lineHeight,
                            }}
                          >
                            <RenderMath text={amplification.title || amplification.name || ""} />
                          </div>
                        </div>
                      </div>
                      {!ampLabel && mark !== undefined && mark !== null && (
                        <span
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(mark)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 5. EXACT CQ BLOCK REPRESENTATION */}
              {cq && (() => {
                const cqDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === cq.questionTypeId ||
                      d.questionTypeName?.includes("সৃজনশীল") ||
                      d.questionTypeName?.toLowerCase().includes("cq")
                  ) || alt.distribution;

                const rawLabel = cqDist?.questionTypeLabel || cq.questionType?.label;
                const cqLabel = rawLabel?.trim()
                  ? rawLabel.trim().endsWith(":") || rawLabel.trim().endsWith("।") ? rawLabel.trim() : `${rawLabel.trim()}:`
                  : null;

                const subQuestions = [
                  { id: "A", label: "ক", text: cq.questionA, marks: cq.markA || 1 },
                  { id: "B", label: "খ", text: cq.questionB, marks: cq.markB || 2 },
                  { id: "C", label: "গ", text: cq.questionC, marks: cq.markC || 3 },
                  { id: "D", label: "ঘ", text: cq.questionD, marks: cq.markD || 4 },
                ].filter((sq) => sq.text);

                return (
                  <div className="w-full flex flex-col">
                    {cqLabel && (
                      <div
                        className="font-bold ml-[0px] mb-0.5 flex items-baseline gap-1"
                        style={{
                          fontSize: questionStyle.fontSize,
                          fontFamily: questionStyle.fontFamily,
                        }}
                      >
                        {renderNumberSpacer()}
                        <span>{cqLabel}</span>
                      </div>
                    )}
                    <div className="flex gap-2 items-start w-full">
                      {!cqLabel && renderNumberSpacer()}
                      <div className="flex-1 w-full min-w-0">
                        {cq.context && (
                          <div
                            className="m-0 text-foreground whitespace-pre-wrap w-full mb-1 leading-relaxed"
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                              lineHeight: questionStyle.lineHeight,
                            }}
                          >
                            <RenderMath text={cq.context} />
                          </div>
                        )}
                        {subQuestions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {subQuestions.map((sq, idx) => (
                              <div key={idx} className="flex gap-2 items-start w-full">
                                {renderSubQuestionLabel(sq.label)}
                                <div
                                  className="m-0 w-full flex-1 min-w-0"
                                  style={{
                                    fontSize: questionStyle.fontSize,
                                    fontFamily: questionStyle.fontFamily,
                                    lineHeight: questionStyle.lineHeight,
                                  }}
                                >
                                  <RenderMath text={sq.text} />
                                </div>
                                <span
                                  className="font-bold text-sm text-[12px] ml-2 shrink-0"
                                  style={{
                                    fontSize: questionStyle.fontSize,
                                    fontFamily: questionStyle.fontFamily,
                                  }}
                                >
                                  {toBengaliDigits(sq.marks)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 6. EXACT SHORT ANSWER BLOCK REPRESENTATION */}
              {sa && (() => {
                const saDist =
                  allDistributions.find(
                    (d: any) =>
                      d.questionTypeId === sa.questionTypeId ||
                      d.questionTypeName?.includes("সংক্ষিপ্ত") ||
                      d.questionTypeName?.toLowerCase().includes("short")
                  ) || alt.distribution;

                const rawLabel = saDist?.questionTypeLabel || sa.questionType?.label;
                const saLabel = rawLabel?.trim()
                  ? rawLabel.trim().endsWith(":") || rawLabel.trim().endsWith("।") ? rawLabel.trim() : `${rawLabel.trim()}:`
                  : null;
                const mark = alt.assignedMarks ?? saDist?.marksPerQuestion ?? primaryMarks ?? 2;
                const attemptCount = saDist?.questionsToAttempt || saDist?.attemptCount || 1;

                return (
                  <div className="w-full flex flex-col">
                    {saLabel && (
                      <div className="flex justify-between items-start w-full mb-0.5">
                        <div
                          className="font-bold ml-[0px] flex items-baseline gap-1"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {renderNumberSpacer()}
                          <span>{saLabel}</span>
                        </div>
                        <div
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(mark)}{" "}
                          <span className="font-sans px-1">×</span>{" "}
                          {toBengaliDigits(attemptCount)} ={" "}
                          {toBengaliDigits(mark * attemptCount)}
                        </div>
                      </div>
                    )}
                    <div className={`flex justify-between items-start gap-2 ${saLabel ? "pl-4" : "w-full"}`}>
                      <div className="flex gap-2 items-start flex-1 min-w-0">
                        {!saLabel && renderNumberSpacer()}
                        {saLabel && renderSubQuestionLabel("ক")}
                        <div className="flex-1 w-full min-w-0">
                          <div
                            className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                              lineHeight: questionStyle.lineHeight,
                            }}
                          >
                            <RenderMath text={sa.question || ""} />
                          </div>
                        </div>
                      </div>
                      {!saLabel && (
                        <span
                          className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                          style={{
                            fontSize: questionStyle.fontSize,
                            fontFamily: questionStyle.fontFamily,
                          }}
                        >
                          {toBengaliDigits(mark)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 7. FALLBACK / MCQ */}
              {!paragraph && !letter && !application && !amplification && !cq && !sa && (
                <div className="flex justify-between items-start gap-2 w-full">
                  <div className="flex gap-2 items-start flex-1 min-w-0">
                    {renderNumberSpacer()}
                    <div className="flex-1 w-full min-w-0">
                      <div
                        className="m-0 w-full whitespace-pre-wrap font-medium text-foreground"
                        style={{
                          fontSize: questionStyle.fontSize,
                          fontFamily: questionStyle.fontFamily,
                          lineHeight: questionStyle.lineHeight,
                        }}
                      >
                        <RenderMath text={cs?.questionA || mcq?.question || alt.contentSnapshot?.question || ""} />
                      </div>
                    </div>
                  </div>
                  {primaryMarks !== undefined && primaryMarks !== null && (
                    <span
                      className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                      style={{
                        fontSize: questionStyle.fontSize,
                        fontFamily: questionStyle.fontFamily,
                      }}
                    >
                      {toBengaliDigits(primaryMarks)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
