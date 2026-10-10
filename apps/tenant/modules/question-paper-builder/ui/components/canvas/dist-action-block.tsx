import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { useQuestionPaperById, useUpsertSubSection } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import { QUESTION_TYPES, QUESTION_TYPE_CODES, QUESTION_TYPE_MAP, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils";
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
  const nameBn = (dist.questionTypeNameBn || dist.questionType?.nameBn || "").toLowerCase();
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

  const distCode = dist?.questionType?.code || dist?.code;
  const distTypeName = dist?.questionTypeNameBn || dist?.questionTypeName || dist?.questionType?.nameEn || dist?.questionType?.nameBn || dist?.questionTypeLabel || "";
  const normalized = normalizeQuestionTypeName(distTypeName) || normalizeQuestionTypeName(dist?.questionType?.nameEn) || normalizeQuestionTypeName(dist?.questionType?.nameBn);

  let resolvedCategory: QuestionTypeCode = QUESTION_TYPE_CODES.MCQ;
  if (normalized && QUESTION_TYPE_MAP[normalized]?.code) {
    resolvedCategory = QUESTION_TYPE_MAP[normalized].code as QuestionTypeCode;
  } else if (distCode && Object.values(QUESTION_TYPE_CODES).includes(distCode.toUpperCase() as QuestionTypeCode)) {
    resolvedCategory = distCode.toUpperCase() as QuestionTypeCode;
  } else {
    const lowerName = distTypeName.toLowerCase();
    if (lowerName.includes("form fillup") || lowerName.includes("form filling") || lowerName.includes("form fill up") || lowerName.includes("ফরম পূরণ") || lowerName.includes("ফরমপুরণ")) {
      resolvedCategory = QUESTION_TYPE_CODES.FORM_FILLUP;
    } else if (lowerName.includes("poem essence") || lowerName.includes("poem_essence") || lowerName.includes("কবিতার মূলভাব")) {
      resolvedCategory = QUESTION_TYPE_CODES.POEM_ESSENCE;
    } else if (lowerName.includes("prose essence") || lowerName.includes("prose_essence") || lowerName.includes("গদ্য অনুচ্ছেদের মূলভাব") || lowerName.includes("গদ্যের মূলভাব")) {
      resolvedCategory = QUESTION_TYPE_CODES.PROSE_ESSENCE;
    } else if (lowerName.includes("substitution table") || lowerName.includes("সাবস্টিটিউশন টেবিল")) {
      resolvedCategory = QUESTION_TYPE_CODES.SUBSTITUTION_TABLE;
    } else if (lowerName.includes("changing sentence") || lowerName.includes("transformation of sentence") || lowerName.includes("বাক্য রূপান্তর") || lowerName.includes("changing sentences")) {
      resolvedCategory = QUESTION_TYPE_CODES.CHANGING_SENTENCES;
    } else if (lowerName.includes("right form") || lowerName.includes("verbs in brackets") || lowerName.includes("correct form of verb") || lowerName.includes("ভার্ব")) {
      resolvedCategory = QUESTION_TYPE_CODES.RIGHT_FORM_OF_VERBS;
    } else if (lowerName.includes("without clues") || lowerName.includes("without clue") || lowerName.includes("ক্লু ছাড়া") || lowerName.includes("ক্লু ছাড়া") || lowerName.includes("ক্লু ব্যতিরেকে") || lowerName.includes("cloze test without")) {
      resolvedCategory = QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITHOUT_CLUES;
    } else if (lowerName.includes("fill in the blanks") || lowerName.includes("with clues") || lowerName.includes("words from the box") || lowerName.includes("from the box") || lowerName.includes("cloze test") || lowerName.includes("ক্লুসহ")) {
      resolvedCategory = QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITH_CLUES;
    } else if (lowerName.includes("parts of speech") || lowerName.includes("part of speech") || lowerName.includes("পদ প্রকরণ")) {
      resolvedCategory = QUESTION_TYPE_CODES.PARTS_OF_SPEECH;
    } else if (lowerName.includes("punctuation") || lowerName.includes("capitalization") || lowerName.includes("বিরাম চিহ্ন") || lowerName.includes("যতিচিহ্ন")) {
      resolvedCategory = QUESTION_TYPE_CODES.PUNCTUATION;
    } else if (lowerName.includes("pbq") || lowerName.includes("passage") || lowerName.includes("অনুচ্ছেদভিত্তিক") || lowerName.includes("বোধ পরীক্ষণ")) {
      resolvedCategory = QUESTION_TYPE_CODES.PBQ;
    } else if (lowerName.includes("letter") || lowerName.includes("চিঠি") || lowerName.includes("পত্র")) {
      resolvedCategory = QUESTION_TYPE_CODES.LETTER;
    } else if (lowerName.includes("application") || lowerName.includes("আবেদন") || lowerName.includes("দরখাস্ত")) {
      resolvedCategory = QUESTION_TYPE_CODES.APPLICATION;
    } else if (lowerName.includes("creative") || lowerName.includes("সৃজনশীল") || lowerName.includes("cq")) {
      resolvedCategory = QUESTION_TYPE_CODES.CQ;
    } else if (lowerName.includes("opposite word") || lowerName.includes("opposite_word") || lowerName.includes("বিপরীত শব্দ") || lowerName.includes("বিপরীত")) {
      resolvedCategory = QUESTION_TYPE_CODES.OPPOSITE_WORD;
    } else if (lowerName.includes("juktoborno") || lowerName.includes("যুক্তবর্ণ")) {
      resolvedCategory = QUESTION_TYPE_CODES.JUKTOBORNO;
    } else if (lowerName.includes("ek kothay") || lowerName.includes("ek kothai") || lowerName.includes("এক কথায়") || lowerName.includes("এক কথায়")) {
      resolvedCategory = QUESTION_TYPE_CODES.EK_KOTHAY_PROKASH;
    } else if (lowerName.includes("synonym") || lowerName.includes("সমার্থক শব্দ") || lowerName.includes("সমার্থক")) {
      resolvedCategory = QUESTION_TYPE_CODES.SYNONYM;
    } else if (lowerName.includes("sadhu to cholito") || lowerName.includes("sadhu_to_cholito") || lowerName.includes("সাধু ও চলিত") || lowerName.includes("সাধু থেকে চলিত") || lowerName.includes("চলিত রূপ")) {
      resolvedCategory = QUESTION_TYPE_CODES.SADHU_TO_CHOLITO;
    } else if (lowerName.includes("pod nirnoy") || lowerName.includes("pod_nirnoy") || lowerName.includes("পদ নির্ণয়") || lowerName.includes("পদ নির্ণয়") || lowerName.includes("পদ নির্নয়")) {
      resolvedCategory = QUESTION_TYPE_CODES.POD_NIRNOY;
    } else if (lowerName.includes("verb tense") || lowerName.includes("verb_tense") || lowerName.includes("ক্রিয়াপদ") || lowerName.includes("ক্রিয়াপদ") || lowerName.includes("ক্রিয়ার কাল") || lowerName.includes("ক্রিয়ার কাল") || lowerName.includes("কাল নির্ণয়") || lowerName.includes("কাল নির্ণয়")) {
      resolvedCategory = QUESTION_TYPE_CODES.VERB_TENSE;
    } else if (lowerName.includes("word meaning") || lowerName.includes("word_meaning") || lowerName.includes("শব্দার্থ")) {
      resolvedCategory = QUESTION_TYPE_CODES.WORD_MEANING;
    } else if (lowerName.includes("make sentence") || lowerName.includes("make_sentence") || lowerName.includes("sentence making") || lowerName.includes("বাক্য রচনা") || lowerName.includes("বাক্য তৈরি") || lowerName.includes("বাক্য গঠন")) {
      resolvedCategory = QUESTION_TYPE_CODES.MAKE_SENTENCES;
    } else if (lowerName.includes("make question") || lowerName.includes("make_question") || lowerName.includes("wh question") || lowerName.includes("wh_question") || lowerName.includes("question making") || lowerName.includes("প্রশ্ন তৈরি") || lowerName.includes("প্রশ্ন গঠন")) {
      resolvedCategory = QUESTION_TYPE_CODES.MAKE_QUESTION;
    } else if (lowerName.includes("descriptive question") || lowerName.includes("descriptive_question") || lowerName.includes("dq") || lowerName.includes("রচনামূলক প্রশ্ন")) {
      resolvedCategory = QUESTION_TYPE_CODES.DESCRIPTIVE_QUESTION;
    } else if (lowerName.includes("shuddho") || lowerName.includes("shudho") || lowerName.includes("ashuddho") || lowerName.includes("শুদ্ধ") || lowerName.includes("অশুদ্ধ")) {
      resolvedCategory = QUESTION_TYPE_CODES.SHUDDHO_ASHUDDHO;
    } else if (lowerName.includes("dan bam") || lowerName.includes("dan_bam") || lowerName.includes("বাম-ডান") || lowerName.includes("ডান-বাম") || lowerName.includes("মিলকরণ") || lowerName.includes("matching")) {
      resolvedCategory = QUESTION_TYPE_CODES.DAN_BAM_MILKORON;
    } else if (lowerName.includes("short question") || lowerName.includes("short_question") || lowerName.includes("sq") || lowerName.includes("সংক্ষিপ্ত প্রশ্ন")) {
      resolvedCategory = QUESTION_TYPE_CODES.SHORT_QUESTION;
    } else if (lowerName.includes("short answer") || (lowerName.includes("short") && !lowerName.includes("composition")) || lowerName.includes("sa")) {
      resolvedCategory = QUESTION_TYPE_CODES.SA;
    } else if (lowerName.includes("essence") || lowerName.includes("সারমর্ম")) {
      resolvedCategory = QUESTION_TYPE_CODES.ESSENCE;
    } else if (lowerName.includes("poem") || lowerName.includes("কবিতা")) {
      resolvedCategory = QUESTION_TYPE_CODES.POEM;
    } else if (lowerName.includes("summary") || lowerName.includes("সারাংশ")) {
      resolvedCategory = QUESTION_TYPE_CODES.SUMMARY;
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
      <div className="border-2 border-dashed border-indigo-500/30 dark:border-indigo-400/30 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 text-center transition-all hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 my-2 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-headline font-bold text-indigo-950 dark:text-indigo-200">
            {dist.questionTypeNameBn || dist.questionTypeName || dist.questionType?.nameBn || dist.questionTypeLabel || dist.questionType?.nameEn}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-solaiman">
            {toBengaliDigits(subAddedCount)} / {toBengaliDigits(subTargetCount)}টি যুক্ত
          </span>
        </div>

        {subSectionId && isSharedQuestionType && (
          <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200 font-semibold bg-card/90 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 shadow-2xs">
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
              className="bg-transparent font-bold cursor-pointer focus:outline-none text-indigo-600 dark:text-indigo-400"
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

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full max-w-sm">
          <Button asChild size="sm" className="w-full sm:w-auto rounded-xl h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-xs shadow-xs cursor-pointer gap-1.5 transition-all active:scale-95">
            <Link href={pickUrl}>
              <span>+ প্রশ্ন নির্বাচন করুন</span>
            </Link>
          </Button>

          {(prevSubSectionId || nextSubSectionId) && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {prevSubSectionId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: prevSubSectionId })}
                  className="flex-1 sm:flex-none rounded-xl border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-bold text-xs h-9 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  title={`পূর্ববর্তী উপ-বিভাগে যান: ${prevSubSectionTitle}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>পূর্ববর্তী</span>
                </Button>
              )}

              {nextSubSectionId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId })}
                  className="flex-1 sm:flex-none rounded-xl border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-bold text-xs h-9 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                  title={`পরবর্তী উপ-বিভাগে যান: ${nextSubSectionTitle}`}
                >
                  <span>পরবর্তী</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};
