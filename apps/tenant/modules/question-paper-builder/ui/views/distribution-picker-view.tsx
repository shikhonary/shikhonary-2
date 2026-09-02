"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import {
  useQuestionPaperById,
  useQuestionPaperDistributionStatuses,
  useAvailableQuestions,
  useBulkAssignQuestions
} from "@/modules/question-paper/services/use-question-paper";
import { useBuilderStore } from "../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "@workspace/ui/components/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { ArrowLeft, Loader2, Save, Search, CheckCircle2, SlidersHorizontal, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionGrid } from "../components/distribution-picker/question-grid";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

interface Props {
  paperId: string;
  distributionId: string;
}

export const DistributionPickerView: React.FC<Props> = ({ paperId, distributionId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSectionId = searchParams.get("sectionId") || undefined;
  const urlSubSectionId = searchParams.get("subSectionId") || undefined;
  const urlQuestionTypeIdParam = searchParams.get("questionTypeId") || undefined;
  const urlLimitParam = searchParams.get("limit");
  const urlLimit = urlLimitParam ? parseInt(urlLimitParam, 10) : undefined;

  const { data: paperQuery, isLoading: paperLoading } = useQuestionPaperById(paperId);
  const { data: statuses, isLoading: statusesLoading } = useQuestionPaperDistributionStatuses(paperId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("All");
  const [selectedBoard, setSelectedBoard] = useState<string>("All");

  const { mutateAsync: bulkAssign, isPending: isAssigning } = useBulkAssignQuestions();

  const distStatus = statuses?.find((s: any) => s.distributionId === distributionId);

  const { data: chaptersData } = useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId: distStatus?.subjectId || "",
    }),
    enabled: Boolean(distStatus?.subjectId),
  });
  const chapters = chaptersData?.academicChapters || [];

  const { data: boardYearsData } = useQuery({
    ...trpc.mcq.boardYears.queryOptions({
      subjectId: distStatus?.subjectId || "",
    }),
    enabled: Boolean(distStatus?.subjectId),
  });
  const boardYears = boardYearsData ?? [];

  if (paperLoading || statusesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background font-display">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!distStatus) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background font-display">
        <p className="text-red-500 font-medium">নম্বর বণ্টন পাওয়া যায়নি।</p>
        <Button asChild className="mt-4">
          <Link href={`/question-papers/${paperId}/builder`}>বিল্ডারে ফিরে যান</Link>
        </Button>
      </div>
    );
  }

  const subSectionQuestionsCount = urlSubSectionId
    ? (paperQuery?.questions || []).filter((q: any) => q.subSectionId === urlSubSectionId && q.distributionId === distributionId).length
    : (urlSectionId
      ? (paperQuery?.questions || []).filter((q: any) => q.sectionId === urlSectionId && q.distributionId === distributionId).length
      : (distStatus.addedCount || 0));

  const effectiveTargetCount = urlLimit ?? distStatus.targetCount ?? 0;
  const maxSelectable = Math.max(0, effectiveTargetCount - subSectionQuestionsCount);

  const qTypeNameEn = (distStatus.questionType?.nameEn || distStatus.questionTypeName || "").toLowerCase();
  const qTypeNameBn = (distStatus.questionType?.nameBn || "").toLowerCase();
  const qTypeCode = (distStatus.questionType?.code || "").toLowerCase();
  const qTypeLabel = (distStatus.questionTypeLabel || "").toLowerCase();
  const combinedStr = `${qTypeNameEn} ${qTypeNameBn} ${qTypeCode} ${qTypeLabel}`.toLowerCase();

  const urlCategoryParam = (searchParams.get("category") || searchParams.get("type") || "").toUpperCase();
  const rawTypeName = (distStatus.questionTypeName || distStatus.questionType?.nameEn || "").trim().toUpperCase();
  const validCategories = ["MCQ", "CQ", "CS", "SA", "PARAGRAPH", "AMPLIFICATION"];

  let category: "MCQ" | "CQ" | "CS" | "SA" | "PARAGRAPH" | "AMPLIFICATION" = "MCQ";
  if (validCategories.includes(urlCategoryParam)) {
    category = urlCategoryParam as any;
  } else if (validCategories.includes(rawTypeName)) {
    category = rawTypeName as any;
  } else if (/\bcs\b/i.test(combinedStr) || combinedStr.includes("creative scenario") || combinedStr.includes("creative short") || combinedStr.includes("scenario")) {
    category = "CS";
  } else if ((combinedStr.includes("creative") || combinedStr.includes("cq") || combinedStr.includes("সৃজনশীল")) && !combinedStr.includes("mcq")) {
    category = "CQ";
  } else if (combinedStr.includes("short") || combinedStr.includes("sa") || combinedStr.includes("সংক্ষিপ্ত")) {
    category = "SA";
  } else if (combinedStr.includes("paragraph") || combinedStr.includes("অনুচ্ছেদ")) {
    category = "PARAGRAPH";
  } else if (combinedStr.includes("amplification") || combinedStr.includes("ভাবসম্প্রসারণ")) {
    category = "AMPLIFICATION";
  }
  const hasActiveQuery = Boolean(search && search.trim() !== "");
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All");
  const hasActiveBoard = Boolean(selectedBoard && selectedBoard !== "All");

  const hasAnyFilter = hasActiveQuery || hasActiveChapter || hasActiveBoard;
  const activeFilterCount = (hasActiveChapter ? 1 : 0) + (hasActiveBoard ? 1 : 0);

  const handleResetAll = () => {
    setSearch("");
    setSelectedChapterId("All");
    setSelectedBoard("All");
  };

  const renderSelectFilters = (isMobile = false) => (
    <>
      {/* Chapter Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            অধ্যায়
          </label>
        )}
        <Select
          value={selectedChapterId}
          onValueChange={(val) => setSelectedChapterId(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 font-body text-sm justify-between h-10">
            <SelectValue placeholder="সকল অধ্যায়" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="All">সকল অধ্যায়</SelectItem>
            {chapters.map((ch: any) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.nameBn || ch.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Board Filter */}
      <div className={isMobile ? "space-y-1.5" : "min-w-[180px] flex-1 md:flex-none"}>
        {isMobile && (
          <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            বোর্ড / বছর
          </label>
        )}
        <Select
          value={selectedBoard}
          onValueChange={(val) => setSelectedBoard(val ?? "All")}
        >
          <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 font-body text-sm justify-between h-10">
            <SelectValue placeholder="সকল বোর্ড" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg max-h-64">
            <SelectItem value="All">সকল বোর্ড</SelectItem>
            {boardYears.map((item: any) => (
              <SelectItem key={item.rawRef} value={item.rawRef}>
                🎓 {item.boardName} ২০{item.year} ({item.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
  const currentDistIndex = statuses?.findIndex((s: any) => s.distributionId === distributionId) ?? -1;
  const nextDistStatus = currentDistIndex !== -1 && currentDistIndex < (statuses?.length || 0) - 1 ? statuses?.[currentDistIndex + 1] : null;

  const handleSaveAndContinue = async (goToNext = false) => {
    if (selectedIds.length === 0) return;
    try {
      const payloadBase = {
        questionPaperId: paperId,
        distributionId,
        sectionId: urlSectionId || (distStatus as any)?.sectionId || undefined,
        subSectionId: urlSubSectionId || (distStatus as any)?.subSectionId || undefined,
      };

      if (category === "SA") {
        await bulkAssign({ ...payloadBase, shortAnswerIds: selectedIds });
      } else if (category === "CQ") {
        await bulkAssign({ ...payloadBase, cqIds: selectedIds });
      } else if (category === "CS") {
        await bulkAssign({ ...payloadBase, csIds: selectedIds });
      } else if (category === "PARAGRAPH") {
        await bulkAssign({ ...payloadBase, paragraphIds: selectedIds });
      } else if (category === "AMPLIFICATION") {
        await bulkAssign({ ...payloadBase, amplificationIds: selectedIds });
      } else {
        await bulkAssign({ ...payloadBase, mcqIds: selectedIds });
      }
      toast.success(`${selectedIds.length}টি প্রশ্ন যুক্ত করা হয়েছে!`);

      const newTotal = subSectionQuestionsCount + selectedIds.length;
      const effectiveSecId = urlSectionId || (distStatus as any)?.sectionId;
      const effectiveSubId = urlSubSectionId || (distStatus as any)?.subSectionId;

      if (effectiveSecId && effectiveSubId && paperQuery?.sections) {
        const sec = paperQuery.sections.find((s: any) => s.id === effectiveSecId);
        if (sec?.subSections && sec.subSections.length > 0) {
          const currentIndex = sec.subSections.findIndex((s: any) => s.id === effectiveSubId);
          if (newTotal >= effectiveTargetCount && currentIndex !== -1 && currentIndex < sec.subSections.length - 1) {
            const nextSub = sec.subSections[currentIndex + 1];
            if (nextSub) {
              useBuilderStore.getState().setActiveTarget({ sectionId: effectiveSecId, subSectionId: nextSub.id });
            }
          }
        }
      }

      if (goToNext && nextDistStatus) {
        setSelectedIds([]);
        router.push(`/question-papers/${paperId}/distributions/${nextDistStatus.distributionId}/pick`);
      } else {
        router.push(`/question-papers/${paperId}/builder`);
      }
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্ন যুক্ত করতে ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/20 font-display">
      {/* Header */}
      <header className="border-b bg-card shrink-0 z-10 shadow-xs">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80 w-8 h-8">
              <Link href={`/question-papers/${paperId}/builder`}>
                <ArrowLeft className="w-4 h-4 text-primary" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-primary font-headline">
                প্রশ্ন নির্বাচন: {distStatus.questionTypeName || distStatus.subjectName}
              </h1>
              <span className="text-xs text-muted-foreground font-body bg-muted px-2.5 py-0.5 rounded-full font-medium">
                টার্গেট: {toBengaliDigits(effectiveTargetCount)}টি • যোগ হয়েছে: {toBengaliDigits(subSectionQuestionsCount)}টি
              </span>
            </div>
          </div>
          {nextDistStatus && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              <Link href={`/question-papers/${paperId}/distributions/${nextDistStatus.distributionId}/pick`}>
                <span>পরবর্তী উপ-বিভাগ</span>
                <ArrowLeft className="w-3.5 h-3.5 ml-1 rotate-180" />
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6 pb-28">

          {/* Primary Filter Toolbar */}
          <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card p-3 sm:p-4 shadow-sm">
            {/* Search Input Filter */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="প্রশ্ন বা বিষয় দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 font-body text-sm rounded-lg border border-outline-variant py-2.5 outline-hidden focus:ring-2 focus:ring-primary/10 h-10"
              />
            </div>

            {/* Mobile Filter Drawer Button (Visible ONLY on mobile) */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-white border-outline-variant/40 text-sm font-medium shrink-0 rounded-lg cursor-pointer"
                  type="button"
                >
                  <span>ফিল্টার</span>
                  {activeFilterCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>

              <DrawerContent className="p-6 space-y-5 bg-white border-t border-outline-variant/40 max-h-[90vh] overflow-y-auto font-display">
                <DrawerHeader className="p-0 text-left">
                  <DrawerTitle className="text-base font-bold text-on-surface flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    ফিল্টার প্রশ্নসমূহ
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground">
                    অধ্যায় ও বোর্ড অনুযায়ী ফিল্টার করুন
                  </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-4 pt-2">
                  {renderSelectFilters(true)}
                </div>

                <DrawerFooter className="p-0 pt-4 flex-row gap-2">
                  {hasAnyFilter && (
                    <Button
                      variant="outline"
                      onClick={handleResetAll}
                      className="flex-1 border-outline-variant text-on-surface text-xs font-bold h-10 rounded-lg"
                    >
                      রিসেট
                    </Button>
                  )}
                  <DrawerClose asChild>
                    <Button className="flex-1 bg-primary text-white text-xs font-bold h-10 rounded-lg">
                      প্রয়োগ করুন
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Desktop Filters (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              {renderSelectFilters(false)}
            </div>
          </div>

          {/* Active Filters Badges */}
          {hasAnyFilter && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-card border border-outline-variant/40 rounded-xl p-2.5 px-4 text-xs font-body shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider mr-1">
                  সক্রিয় ফিল্টার:
                </span>

                {hasActiveQuery && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors font-medium text-[11px] sm:text-xs"
                  >
                    <span>খোঁজ: "{search}"</span>
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="hover:text-primary/70 cursor-pointer focus:outline-hidden"
                      title="Remove search query"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {hasActiveChapter && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors font-medium text-[11px] sm:text-xs"
                  >
                    <span>অধ্যায়: {chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn || chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedChapterId("All")}
                      className="hover:text-primary/70 cursor-pointer focus:outline-hidden"
                      title="Remove chapter filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {hasActiveBoard && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors font-medium text-[11px] sm:text-xs"
                  >
                    <span>বোর্ড: {selectedBoard}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBoard("All")}
                      className="hover:text-primary/70 cursor-pointer focus:outline-hidden"
                      title="Remove board filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Question Grid */}
          <QuestionGrid
            subjectId={distStatus.subjectId}
            questionTypeId={urlQuestionTypeIdParam || distStatus.questionTypeId}
            category={category}
            search={search}
            chapterId={selectedChapterId}
            board={selectedBoard}
            excludePaperId={paperId}
            selectedIds={selectedIds}
            onToggle={(id) => {
              setSelectedIds(prev => {
                if (prev.includes(id)) {
                  return prev.filter(x => x !== id);
                }
                if (effectiveTargetCount > 0 && prev.length >= maxSelectable) {
                  if (maxSelectable === 0) {
                    toast.error("এই অংশের প্রশ্নের লক্ষ্য ইতিমধ্যে পূরণ হয়ে গেছে।");
                  } else {
                    toast.error(`আপনি এই অংশের জন্য সর্বোচ্চ ${toBengaliDigits(maxSelectable)}টি অতিরিক্ত প্রশ্ন নির্বাচন করতে পারবেন।`);
                  }
                  return prev;
                }
                return [...prev, id];
              });
            }}
          />

        </div>
      </main>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-card border border-primary/30 shadow-2xl rounded-xl md:rounded-full p-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center gap-1.5 md:gap-6 z-50 animate-in slide-in-from-bottom-8">
          <div className="text-xs md:text-sm font-bold text-on-surface flex items-center justify-between w-full md:w-auto px-1 md:px-0">
            <span>
              <span className="text-primary font-bold">{toBengaliDigits(selectedIds.length)}টি</span> নির্বাচিত
            </span>
            <span className="text-muted-foreground md:ml-2 font-normal text-[11px] md:text-xs">
              (প্রয়োজন: {toBengaliDigits(maxSelectable)}টি)
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {nextDistStatus && (
              <Button
                variant="outline"
                className="w-full md:w-auto rounded-lg md:rounded-full h-auto md:h-10 border-primary/40 text-primary hover:bg-primary/10 font-bold cursor-pointer gap-2 text-xs md:text-sm py-2.5 md:py-2 px-4 shrink-0"
                disabled={isAssigning}
                onClick={() => handleSaveAndContinue(true)}
              >
                {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>সংরক্ষণ ও পরবর্তী উপ-বিভাগ</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Button>
            )}
            <Button
              className="w-full md:w-auto rounded-lg md:rounded-full h-auto md:h-10 bg-primary text-white font-bold cursor-pointer gap-2 text-xs md:text-sm py-2.5 md:py-2 px-4 shrink-0"
              disabled={isAssigning}
              onClick={() => handleSaveAndContinue(false)}
            >
              {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>সংরক্ষণ ও বিল্ডারে ফিরে যান</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
