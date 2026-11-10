import React from "react";
import { useBuilderStore } from "../../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { useQuestionPaperById, useUpsertSubSection } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "@workspace/ui/components/sonner";
import { resolveDistCategory, toBengaliDigits } from "@workspace/utils";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useDistLimits } from "./use-dist-limits";

export const DistActionBlock: React.FC<{ blockData: any }> = ({ blockData }) => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const { mutateAsync: upsertSubSection } = useUpsertSubSection();

  const {
    dist,
    paperId,
    sectionId,
    subSectionId,
    prevSubSectionId,
    prevSubSectionTitle,
    nextSubSectionId,
    nextSubSectionTitle,
  } = blockData ?? {};

  const { data: paperQuery } = useQuestionPaperById(paperId ?? "");

  const {
    pickLimit,
    dropdownMax,
    currentAttempt,
    sharedTypeAttempt,
    addedCount,
    targetCount,
    showAttemptSelector,
    isCompleted,
    category,
  } = useDistLimits(blockData, paperQuery);

  if (isExporting || isCompleted) return null;

  // ── Build pick URL ──────────────────────────────────────────────────────
  const resolvedCategory = category || resolveDistCategory(dist);
  const queryParams = new URLSearchParams({ category: resolvedCategory });
  if (sectionId) queryParams.set("sectionId", sectionId);
  if (subSectionId) queryParams.set("subSectionId", subSectionId);
  if (dist?.questionTypeId) queryParams.set("questionTypeId", dist.questionTypeId);
  if (pickLimit > 0) queryParams.set("limit", String(pickLimit));
  const pickUrl = `/question-papers/${paperId}/distributions/${dist?.id}/pick?${queryParams}`;

  const isCurrentActive = !subSectionId || activeSubSectionId === subSectionId;

  return (
    <div
      onClick={() => {
        if (subSectionId) setActiveTarget({ sectionId: sectionId ?? null, subSectionId });
      }}
      className={`border-2 border-dashed ${
        isCurrentActive
          ? "border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20"
          : "border-slate-300 dark:border-white/10 hover:border-indigo-400/40 bg-slate-50/40 dark:bg-white/[0.02]"
      } rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 text-center transition-all hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 my-2 print:hidden cursor-pointer`}
    >
      {/* ── Badge ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-headline font-bold text-indigo-950 dark:text-indigo-200">
          {dist?.questionTypeLabel ||
            dist?.questionTypeNameBn ||
            dist?.questionTypeName ||
            dist?.questionType?.nameBn ||
            dist?.questionType?.nameEn}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-solaiman">
          {toBengaliDigits(addedCount)} / {toBengaliDigits(targetCount)}টি যুক্ত
        </span>
      </div>

      {/* ── questionsToAttempt dropdown (SUBSECTION_SHARED only) ──────── */}
      {subSectionId && showAttemptSelector && (
        <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200 font-semibold bg-card/90 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 shadow-2xs">
          <span>উত্তর দিতে হবে:</span>
          <select
            value={currentAttempt > 0 ? String(currentAttempt) : ""}
            onMouseDown={(e) => {
              if (dropdownMax <= 0 && currentAttempt === 0) {
                e.preventDefault();
                toast.error(
                  `এই প্রশ্নের ধরণের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sharedTypeAttempt)}টি) ইতিমধ্যেই অন্যান্য উপ-বিভাগে সম্পূর্ণ পূরণ করা হয়েছে।`
                );
              }
            }}
            onChange={async (e) => {
              const val = parseInt(e.target.value, 10);

              if (isNaN(val) || !val) {
                try {
                  await upsertSubSection({ id: subSectionId, questionsToAttempt: 0 });
                  toast.success("আবশ্যক প্রশ্নের সংখ্যা রিসেট করা হয়েছে");
                } catch (err: any) {
                  toast.error(err?.message ?? "হালনাগাদ করতে ব্যর্থ হয়েছে");
                }
                return;
              }

              if (dropdownMax <= 0) {
                toast.error(
                  `এই প্রশ্নের ধরণের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sharedTypeAttempt)}টি) ইতিমধ্যেই অন্যান্য উপ-বিভাগে সম্পূর্ণ পূরণ করা হয়েছে।`
                );
                return;
              }

              if (sharedTypeAttempt > 0 && val > dropdownMax) {
                toast.error(
                  `ভুল মান: এই ধরণের মোট আবশ্যক প্রশ্নের সংখ্যা (${toBengaliDigits(sharedTypeAttempt)}টি) অতিক্রম করা যাবে না। এই উপ-বিভাগে সর্বোচ্চ ${toBengaliDigits(dropdownMax)}টি উত্তর নির্ধারণ করতে পারবেন।`
                );
                return;
              }

              try {
                await upsertSubSection({ id: subSectionId, questionsToAttempt: val });
                toast.success(`উত্তর দিতে হবে: ${toBengaliDigits(val)}টি নির্ধারিত হয়েছে`);
              } catch (err: any) {
                toast.error(err?.message ?? "হালনাগাদ করতে ব্যর্থ হয়েছে");
              }
            }}
            className="bg-transparent font-bold cursor-pointer focus:outline-none text-indigo-600 dark:text-indigo-400"
          >
            <option value="" className="text-muted-foreground">
              {dropdownMax <= 0 ? "কোটা পূর্ণ" : "নির্বাচন করুন"}
            </option>
            {Array.from({ length: dropdownMax }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {toBengaliDigits(n)}টি
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Pick button + prev/next nav ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full max-w-sm">
        <Button
          asChild
          size="sm"
          className="w-full sm:w-auto rounded-xl h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-xs shadow-xs cursor-pointer gap-1.5 transition-all active:scale-95"
        >
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
                onClick={() => setActiveTarget({ sectionId: sectionId ?? null, subSectionId: prevSubSectionId })}
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
                onClick={() => setActiveTarget({ sectionId: sectionId ?? null, subSectionId: nextSubSectionId })}
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
};
