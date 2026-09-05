import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { useQuestionPaperById, useUpsertSubSection } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import { QUESTION_TYPES, QUESTION_TYPE_CODES, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

export const DistActionBlock: React.FC<{ blockData: any }> = ({ blockData }) => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const { mutateAsync: upsertSubSection } = useUpsertSubSection();

  const { dist, status, statusInfo, paperId, prevSubSectionId, prevSubSectionTitle, nextSubSectionId, nextSubSectionTitle, sectionId, subSectionId, isSharedQuestionType, siblingSubSectionIds } = blockData || {};

  const { data: paperQuery } = useQuestionPaperById(paperId || "");

  if (isExporting) return null;

  const sec = (sectionId && paperQuery?.sections)
    ? paperQuery.sections.find((s: any) => s.id === sectionId)
    : null;

  // ── Find sub-sections in this section sharing the same question type ──
  const subIdsWithSameQuestionType = new Set<string>(siblingSubSectionIds || (subSectionId ? [subSectionId] : []));

  // ── Compute targetLimit from distribution's questionCount ──
  const distTotal = dist.questionCount || statusInfo?.targetCount || 0;
  let targetLimit = distTotal;

  if (subSectionId && sectionId && paperQuery?.sections) {
    if (sec && sec.subSections && sec.subSections.length > 1) {
      // Sum of other sub-sections sharing the same question type:
      // Accounts for assigned questions (qCount) and remaining required questions (sReq)
      const otherSubOccupied = (sec.subSections || [])
        .filter((s: any) => s.id !== subSectionId && subIdsWithSameQuestionType.has(s.id))
        .reduce((sum: number, s: any) => {
          const qCount = (paperQuery?.questions || []).filter((q: any) => q.subSectionId === s.id).length;
          const sReq = (s.questionsToAttempt && s.questionsToAttempt > 0) ? s.questionsToAttempt : 0;
          return sum + Math.max(qCount, sReq);
        }, 0);

      // This sub-section can pick at most: dist.questionCount - otherSubOccupied
      targetLimit = Math.max(1, distTotal - otherSubOccupied);
    }
  }

  const nameEn = (dist.questionTypeName || dist.questionType?.nameEn || "").toLowerCase();
  const nameBn = (dist.questionType?.nameBn || "").toLowerCase();
  const label = (dist.questionTypeLabel || dist.questionType?.label || "").toLowerCase();
  const code = (dist.questionType?.code || "").toLowerCase();

  let subTitleStr = "";
  if (subSectionId && paperQuery?.sections) {
    for (const s of paperQuery.sections) {
      if (s.subSections) {
        const matchingSub = s.subSections.find((subItem: any) => subItem.id === subSectionId);
        if (matchingSub) {
          subTitleStr = `${matchingSub.title || ""} ${matchingSub.titleBn || ""} ${matchingSub.instructions || ""}`.toLowerCase();
          break;
        }
      }
    }
  }

  let secTitleStr = "";
  if (sectionId && paperQuery?.sections) {
    const matchingSec = paperQuery.sections.find((s: any) => s.id === sectionId);
    if (matchingSec) {
      secTitleStr = `${matchingSec.title || ""} ${matchingSec.titleBn || ""} ${matchingSec.instructions || ""}`.toLowerCase();
    }
  }

  const combinedStr = `${nameEn} ${nameBn} ${label} ${code} ${subTitleStr} ${secTitleStr}`.toLowerCase();

  const distTypeName = dist?.questionTypeName || dist?.questionType?.nameEn || dist?.questionType?.nameBn || dist?.questionTypeLabel || "";
  const normalized = normalizeQuestionTypeName(distTypeName) || normalizeQuestionTypeName(dist?.questionType?.nameEn) || normalizeQuestionTypeName(dist?.questionType?.nameBn);

  let resolvedCategory: QuestionTypeCode = QUESTION_TYPE_CODES.MCQ;
  if (normalized === QUESTION_TYPES.CS) {
    resolvedCategory = QUESTION_TYPE_CODES.CS;
  } else if (normalized === QUESTION_TYPES.CQ) {
    resolvedCategory = QUESTION_TYPE_CODES.CQ;
  } else if (normalized === QUESTION_TYPES.SA) {
    resolvedCategory = QUESTION_TYPE_CODES.SA;
  } else if (normalized === QUESTION_TYPES.PARAGRAPH) {
    resolvedCategory = QUESTION_TYPE_CODES.PARAGRAPH;
  } else if (normalized === QUESTION_TYPES.THOUGHT_EXPANSION) {
    resolvedCategory = QUESTION_TYPE_CODES.AMPLIFICATION;
  } else if (normalized === QUESTION_TYPES.LETTER) {
    resolvedCategory = QUESTION_TYPE_CODES.LETTER;
  } else if (normalized === QUESTION_TYPES.APPLICATION) {
    resolvedCategory = QUESTION_TYPE_CODES.APPLICATION;
  } else if (normalized === QUESTION_TYPES.SUMMARY) {
    resolvedCategory = QUESTION_TYPE_CODES.SUMMARY;
  } else if (normalized === QUESTION_TYPES.ESSENCE) {
    resolvedCategory = QUESTION_TYPE_CODES.ESSENCE;
  } else if (normalized === QUESTION_TYPES.NEWS_REPORT) {
    resolvedCategory = QUESTION_TYPE_CODES.NEWS_REPORT;
  } else if (normalized === QUESTION_TYPES.ESSAY) {
    resolvedCategory = QUESTION_TYPE_CODES.ESSAY;
  } else if (normalized === QUESTION_TYPES.MCQ) {
    resolvedCategory = QUESTION_TYPE_CODES.MCQ;
  } else {
    // Robust fallback based on distribution questionTypeName
    const lowerName = distTypeName.toLowerCase();
    if (lowerName.includes("letter") || lowerName.includes("চিঠি") || lowerName.includes("পত্র")) {
      resolvedCategory = QUESTION_TYPE_CODES.LETTER;
    } else if (lowerName.includes("application") || lowerName.includes("আবেদন") || lowerName.includes("দরখাস্ত")) {
      resolvedCategory = QUESTION_TYPE_CODES.APPLICATION;
    } else if (lowerName.includes("creative") || lowerName.includes("সৃজনশীল") || lowerName.includes("cq")) {
      resolvedCategory = QUESTION_TYPE_CODES.CQ;
    } else if (lowerName.includes("short") || lowerName.includes("সংক্ষিপ্ত") || lowerName.includes("sa")) {
      resolvedCategory = QUESTION_TYPE_CODES.SA;
    } else if (lowerName.includes("paragraph") || lowerName.includes("অনুচ্ছেদ")) {
      resolvedCategory = QUESTION_TYPE_CODES.PARAGRAPH;
    } else if (lowerName.includes("expansion") || lowerName.includes("amplification") || lowerName.includes("ভাব")) {
      resolvedCategory = QUESTION_TYPE_CODES.AMPLIFICATION;
    } else if (lowerName.includes("report") || lowerName.includes("প্রতিবেদন")) {
      resolvedCategory = QUESTION_TYPE_CODES.NEWS_REPORT;
    } else if (lowerName.includes("summary") || lowerName.includes("সারাংশ") || lowerName.includes("সারমর্ম")) {
      resolvedCategory = QUESTION_TYPE_CODES.SUMMARY;
    } else if (lowerName.includes("essay") || lowerName.includes("রচনা") || lowerName.includes("প্রবন্ধ")) {
      resolvedCategory = QUESTION_TYPE_CODES.ESSAY;
    }
  }

  const queryParams = new URLSearchParams();
  if (sectionId) queryParams.set("sectionId", sectionId);
  if (subSectionId) queryParams.set("subSectionId", subSectionId);
  if (dist.questionTypeId) queryParams.set("questionTypeId", dist.questionTypeId);
  queryParams.set("category", resolvedCategory);
  if (targetLimit > 0) {
    queryParams.set("limit", String(targetLimit));
  }
  const pickUrl = `/question-papers/${paperId}/distributions/${dist.id}/pick` + 
    (queryParams.toString() ? `?${queryParams.toString()}` : "");

  const subAddedCount = subSectionId && paperQuery?.questions
    ? paperQuery.questions.filter((q: any) => q.subSectionId === subSectionId).length
    : (statusInfo?.addedCount || 0);

  const subTargetCount = blockData?.subPickLimit || dist.questionCount || statusInfo?.targetCount || 1;

  // ── Compute dropdown validation: accumulate questionsToAttempt of sub-sections sharing same question type and compare to section questionsToAttempt ──
  const sectionQuestionsToAttempt = (sec?.questionsToAttempt && sec.questionsToAttempt > 0)
    ? sec.questionsToAttempt
    : (dist.questionsToAttempt && dist.questionsToAttempt > 0 ? dist.questionsToAttempt : 0);

  let otherSubAttemptForDropdown = 0;
  if (sec && sec.subSections && sec.subSections.length > 1) {
    otherSubAttemptForDropdown = sec.subSections
      .filter((s: any) => s.id !== subSectionId && subIdsWithSameQuestionType.has(s.id))
      .reduce((sum: number, s: any) => {
        const sReq = (s.questionsToAttempt && s.questionsToAttempt > 0) ? s.questionsToAttempt : 0;
        return sum + sReq;
      }, 0);
  }

  const maxAllowedRequired = sectionQuestionsToAttempt > 0
    ? Math.max(0, sectionQuestionsToAttempt - otherSubAttemptForDropdown)
    : (dist.questionsToAttempt && dist.questionsToAttempt > 0 ? dist.questionsToAttempt : 0);

  const dropdownMaxOptions = maxAllowedRequired;

  const rawAttempt = (blockData?.subQuestionsToAttempt && blockData.subQuestionsToAttempt > 0) 
    ? blockData.subQuestionsToAttempt 
    : 0;
  const currentAttempt = (rawAttempt > 0) ? String(Math.min(rawAttempt, Math.max(1, dropdownMaxOptions))) : "";

  if (status !== "COMPLETED") {
    return (
      <div className="border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2.5 text-center transition-colors hover:bg-primary/10 my-2 print:hidden">
        <p className="text-xs sm:text-sm font-semibold text-primary">
          {dist.questionTypeLabel || dist.questionType?.nameBn || dist.questionType?.nameEn} ({toBengaliDigits(subAddedCount)}/{toBengaliDigits(subTargetCount)}টি)
        </p>

        {subSectionId && isSharedQuestionType && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-semibold bg-background/90 px-3 py-1 rounded-full border border-primary/30 shadow-xs">
            <span>উত্তর দিতে হবে:</span>
            <select
              value={currentAttempt}
              onMouseDown={(e) => {
                if (maxAllowedRequired <= 0 && (!currentAttempt || currentAttempt === "0")) {
                  e.preventDefault();
                  toast.error(`সেকশনের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sectionQuestionsToAttempt)}টি) ইতিমধ্যেই অন্যান্য উপ-বিভাগে সম্পূর্ণ পূরণ করা হয়েছে।`);
                }
              }}
              onChange={async (e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || !val) {
                  try {
                    await upsertSubSection({
                      id: subSectionId,
                      questionsToAttempt: 0,
                    });
                    toast.success("আবশ্যক প্রশ্নের সংখ্যা রিসেট করা হয়েছে");
                  } catch (err: any) {
                    toast.error(err?.message || "হালনাগাদ করতে ব্যর্থ হয়েছে");
                  }
                  return;
                }

                if (maxAllowedRequired <= 0) {
                  toast.error(`সেকশনের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sectionQuestionsToAttempt)}টি) ইতিমধ্যেই অন্যান্য উপ-বিভাগে সম্পূর্ণ পূরণ করা হয়েছে।`);
                  return;
                }

                if (sectionQuestionsToAttempt > 0 && val > maxAllowedRequired) {
                  toast.error(`ভুল মান: সেকশনের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sectionQuestionsToAttempt)}টি) অতিক্রম করা যাবে না। এই উপ-বিভাগে সর্বোচ্চ ${toBengaliDigits(maxAllowedRequired)}টি উত্তর নির্ধারণ করতে পারবেন।`);
                  return;
                }

                try {
                  await upsertSubSection({
                    id: subSectionId,
                    questionsToAttempt: val,
                  });
                  toast.success(`উত্তর দিতে হবে: ${toBengaliDigits(val)}টি নির্ধারিত হয়েছে`);
                } catch (err: any) {
                  toast.error(err?.message || "হালনাগাদ করতে ব্যর্থ হয়েছে");
                }
              }}
              className="bg-transparent font-bold cursor-pointer focus:outline-none text-primary"
            >
              <option value="" className="text-muted-foreground">
                {maxAllowedRequired <= 0 ? "কোটা পূর্ণ" : "নির্বাচন করুন"}
              </option>
              {Array.from({ length: dropdownMaxOptions }, (_, i) => i + 1).map((n) => (
                <option key={n} value={String(n)}>{toBengaliDigits(n)}টি</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          {prevSubSectionId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId })}
              className="rounded-full border-primary/40 text-primary hover:bg-primary/10 font-bold text-xs h-8 cursor-pointer flex items-center gap-1"
              title={`পূর্ববর্তী উপ-বিভাগে যান: ${prevSubSectionTitle}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>পূর্ববর্তী</span>
            </Button>
          )}
          <Button asChild size="sm" className="rounded-full shadow-xs cursor-pointer font-bold">
            <Link href={pickUrl}>
              + প্রশ্ন নির্বাচন করুন
            </Link>
          </Button>
          {nextSubSectionId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId })}
              className="rounded-full border-primary/40 text-primary hover:bg-primary/10 font-bold text-xs h-8 cursor-pointer flex items-center gap-1"
              title={`পরবর্তী উপ-বিভাগে যান: ${nextSubSectionTitle}`}
            >
              <span>পরবর্তী</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }
  return null;
};
