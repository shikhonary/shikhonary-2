"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import { 
  useQuestionPaperById, 
  useQuestionPaperDistributionStatuses,
  useAvailableQuestions,
  useBulkAssignQuestions
} from "@/modules/question-paper/services/use-question-paper";
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

interface Props {
  paperId: string;
  distributionId: string;
}

export const DistributionPickerView: React.FC<Props> = ({ paperId, distributionId }) => {
  const router = useRouter();
  
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

  const qTypeNameEn = (distStatus.questionType?.nameEn || "").toLowerCase();
  const qTypeNameBn = distStatus.questionType?.nameBn || "";

  let category: "MCQ" | "CQ" | "SA" = "MCQ";
  if (qTypeNameEn.includes("short") || qTypeNameBn.includes("সংক্ষিপ্ত")) {
    category = "SA";
  } else if ((qTypeNameEn.includes("creative") || qTypeNameEn.includes("cq") || qTypeNameBn.includes("সৃজনশীল")) && !qTypeNameEn.includes("mcq")) {
    category = "CQ";
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
  const handleSaveAndContinue = async () => {
    if (selectedIds.length === 0) return;
    try {
      if (category === "SA") {
        await bulkAssign({ questionPaperId: paperId, distributionId, shortAnswerIds: selectedIds });
      } else if (category === "CQ") {
        await bulkAssign({ questionPaperId: paperId, distributionId, cqIds: selectedIds });
      } else {
        await bulkAssign({ questionPaperId: paperId, distributionId, mcqIds: selectedIds });
      }
      toast.success(`${selectedIds.length}টি প্রশ্ন যুক্ত করা হয়েছে!`);
      router.push(`/question-papers/${paperId}/builder`);
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
                টার্গেট: {distStatus.targetCount}টি • যোগ হয়েছে: {distStatus.addedCount}টি
              </span>
            </div>
          </div>
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
                  <DrawerDescription className="text-xs text-on-surface-variant font-body">
                    প্রশ্নপত্র তৈরির জন্য প্রয়োজনীয় অধ্যায় এবং বোর্ড ফিল্টার নির্বাচন করুন।
                  </DrawerDescription>
                </DrawerHeader>

                {/* Stacked Filter Selects */}
                <div className="space-y-4 pt-1">
                  {renderSelectFilters(true)}
                </div>

                <DrawerFooter className="p-0 pt-3 flex flex-row items-center gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleResetAll}
                    className="flex-1 h-10 text-xs font-bold border-outline-variant/40 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    রিসেট
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1 h-10 text-xs font-bold bg-primary text-white cursor-pointer" type="button">
                      ফিল্টার প্রয়োগ করুন
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Desktop Filter Selects (Visible ONLY on desktop) */}
            <div className="hidden md:flex flex-wrap items-center gap-3">
              {renderSelectFilters(false)}
            </div>
          </div>

          {/* Active Filter Badges & Reset Row */}
          {hasAnyFilter && (
            <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:border-0 sm:p-0 sm:px-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-outline text-[11px] sm:text-xs uppercase tracking-wider font-body">
                  সক্রিয় ফিল্টার:
                </span>

                {/* Search Query Badge */}
                {hasActiveQuery && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal max-w-[200px] truncate"
                  >
                    <span className="truncate">খুঁজুন: &quot;{search}&quot;</span>
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                      title="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Chapter Badge */}
                {hasActiveChapter && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
                  >
                    <span>
                      অধ্যায়: {chapters.find(c => c.id === selectedChapterId)?.nameBn || chapters.find(c => c.id === selectedChapterId)?.nameEn || selectedChapterId}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedChapterId("All")}
                      className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                      title="Remove chapter filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Board Badge */}
                {hasActiveBoard && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 rounded-md border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[11px] sm:text-xs font-medium text-on-surface hover:bg-surface-container-highest cursor-default normal-case tracking-normal shrink-0"
                  >
                    <span>
                      বোর্ড:{" "}
                      {(() => {
                        const matched = boardYears.find((item: any) => item.rawRef === selectedBoard);
                        return matched ? `${matched.boardName} ২০${matched.year}` : selectedBoard;
                      })()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBoard("All")}
                      className="rounded-full p-0.5 hover:bg-outline-variant/30 transition-colors cursor-pointer shrink-0"
                      title="Remove board filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>

              {/* Reset All Badge */}
              <div className="flex justify-end border-t border-outline-variant/20 pt-2 sm:border-0 sm:pt-0">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="cursor-pointer focus:outline-hidden"
                  title="Reset all active filters"
                >
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/20 transition-colors normal-case tracking-normal"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>রিসেট করুন</span>
                  </Badge>
                </button>
              </div>
            </div>
          )}

          {/* Question Grid */}
          <QuestionGrid 
            subjectId={distStatus.subjectId}
            questionTypeId={distStatus.questionTypeId}
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
                const maxAllowed = Math.max(0, distStatus.targetCount - distStatus.addedCount);
                if (prev.length >= maxAllowed && maxAllowed > 0) {
                  toast.error(`এই বণ্টনের জন্য সর্বোচ্চ আরও ${maxAllowed}টি প্রশ্ন নির্বাচন করা যাবে।`);
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
              <span className="text-primary font-bold">{selectedIds.length}টি</span> নির্বাচিত
            </span>
            <span className="text-muted-foreground md:ml-2 font-normal text-[11px] md:text-xs">
              (প্রয়োজন: {Math.max(0, distStatus.targetCount - distStatus.addedCount)}টি)
            </span>
          </div>
          <Button 
            className="w-full md:w-auto rounded-lg md:rounded-full h-auto md:h-10 bg-primary text-white font-bold cursor-pointer gap-2 text-xs md:text-sm py-2.5 md:py-2 px-4 shrink-0"
            disabled={isAssigning}
            onClick={handleSaveAndContinue}
          >
            {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            সংরক্ষণ ও বিল্ডারে ফিরে যান
          </Button>
        </div>
      )}
    </div>
  );
};

function QuestionGrid({ 
  subjectId, 
  questionTypeId, 
  category, 
  search, 
  chapterId,
  board,
  excludePaperId,
  selectedIds, 
  onToggle 
}: { 
  subjectId: string, 
  questionTypeId: string, 
  category: "MCQ" | "CQ" | "SA", 
  search: string, 
  chapterId: string,
  board: string,
  excludePaperId: string,
  selectedIds: string[], 
  onToggle: (id: string) => void 
}) {
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
    return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground bg-card border rounded-2xl p-8 font-body">
        কোনো প্রশ্ন পাওয়া যায়নি। অন্য কোনো ফিল্টার বা অনুসন্ধান শব্দ ব্যবহার করুন।
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${category === "CQ" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
      {questions.map((q: any) => {
        const isSelected = selectedIds.includes(q.id);
        const isAssigned = q.isAssigned;
        const combinedContext = q.type === "COMBINED" && Array.isArray(q.attachments)
          ? q.attachments.find((att: any) => att.caption)?.caption
          : null;

        return (
          <div 
            key={q.id} 
            onClick={() => {
              if (!isAssigned) onToggle(q.id);
            }}
            className={`bg-card border rounded-2xl p-4 sm:p-5 transition-all relative font-display ${
              isAssigned
                ? "opacity-60 bg-muted/40 border-muted cursor-not-allowed"
                : isSelected 
                  ? "border-transparent shadow-md cursor-pointer" 
                  : "hover:border-primary/50 hover:shadow-sm border-outline-variant cursor-pointer"
            }`}
          >
            {/* Animated selection corner borders */}
            <div className={`absolute -top-[1px] -left-[1px] w-14 h-14 border-t-4 border-l-4 border-primary rounded-tl-2xl pointer-events-none transition-all duration-200 origin-top-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`} />
            <div className={`absolute -top-[1px] -right-[1px] w-14 h-14 border-t-4 border-r-4 border-primary rounded-tr-2xl pointer-events-none transition-all duration-200 origin-top-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`} />
            <div className={`absolute -bottom-[1px] -left-[1px] w-14 h-14 border-b-4 border-l-4 border-primary rounded-bl-2xl pointer-events-none transition-all duration-200 origin-bottom-left ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`} />
            <div className={`absolute -bottom-[1px] -right-[1px] w-14 h-14 border-b-4 border-r-4 border-primary rounded-br-2xl pointer-events-none transition-all duration-200 origin-bottom-right ${
              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`} />
            <div className={`absolute top-4 right-4 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 z-10 ${
                isAssigned
                  ? "bg-muted text-muted-foreground border-muted-foreground/30"
                  : isSelected 
                    ? "bg-primary border-primary text-white" 
                    : "border-outline-variant bg-white"
            }`}>
              {isAssigned ? (
                <span className="text-[10px] font-bold">যোগকৃত</span>
              ) : isSelected ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 mb-3 pr-16">
              {q.chapter && (
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground text-xs font-medium">
                  {q.chapter?.nameBn || q.chapter?.nameEn}
                </Badge>
              )}
              {q.type && (
                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs font-medium">
                  {q.type === "SINGLE" ? "সাধারণ" : q.type === "MULTIPLE" ? "বহুপদি" : q.type === "COMBINED" ? "অভিন্ন" : q.type}
                </Badge>
              )}
            </div>

            {category === "SA" ? (
              <div className="flex flex-col gap-3 font-body">
                <div className="text-sm font-semibold text-on-surface">
                  <RenderMath text={q.question} />
                </div>
                {q.answer && (
                  <div className="text-xs text-muted-foreground mt-1 border-l-2 border-primary/40 pl-3">
                    <span className="font-semibold text-primary block mb-0.5">উত্তর:</span>
                    <RenderMath text={q.answer} />
                  </div>
                )}
              </div>
            ) : category === "CQ" ? (
              <div className="flex flex-col gap-3 font-body">
                {q.context && (
                  <div className="text-xs text-on-surface-variant bg-muted/40 p-3 rounded-xl whitespace-pre-wrap border border-outline-variant">
                    <RenderMath text={q.context} />
                  </div>
                )}
                <div className="space-y-2 mt-1">
                  {q.questionA && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">ক</span>
                      <span className="text-xs mt-1"><RenderMath text={q.questionA} /></span>
                    </div>
                  )}
                  {q.questionB && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">খ</span>
                      <span className="text-xs mt-1"><RenderMath text={q.questionB} /></span>
                    </div>
                  )}
                  {q.questionC && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">গ</span>
                      <span className="text-xs mt-1"><RenderMath text={q.questionC} /></span>
                    </div>
                  )}
                  {q.questionD && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold text-xs">ঘ</span>
                      <span className="text-xs mt-1"><RenderMath text={q.questionD} /></span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 font-body">
                {(q.questionContext?.text || combinedContext) && (
                  <div className="text-xs text-on-surface-variant bg-muted/40 p-2.5 rounded-xl whitespace-pre-wrap border border-outline-variant">
                    <RenderMath text={q.questionContext?.text || combinedContext || ""} />
                  </div>
                )}
                {q.statements && q.statements.length > 0 && (
                  <div className="text-xs space-y-1">
                    {q.statements.map((stmt: string, i: number) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="font-medium text-muted-foreground">{["i", "ii", "iii", "iv"][i] || (i + 1)}.</span>
                        <span><RenderMath text={stmt} /></span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-sm font-semibold text-on-surface">
                  <RenderMath text={q.question} />
                </div>
                {Array.isArray(q.attachments) && q.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-1">
                    {q.attachments.map((att: any, attIdx: number) => {
                      const isImage = att.type === "image" || /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(att.url);
                      if (isImage && att.url !== "text-context") {
                        return (
                          <div key={attIdx} className="space-y-1">
                            <img
                              src={att.url}
                              alt={att.caption || "Attachment"}
                              className="max-h-36 rounded-lg border border-outline-variant/60 object-contain bg-muted/20"
                            />
                            {att.caption && (
                              <p className="text-[10px] text-outline font-medium italic pl-1">{att.caption}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                    {q.options.map((opt: string, i: number) => {
                      const label = ["ক", "খ", "গ", "ঘ"][i] || "";
                      const isAnswer = q.answer === String(i + 1) || q.answer === label || q.answer === opt;
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex items-start gap-1.5 p-2 rounded-lg border text-xs ${
                            isAnswer 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium" 
                              : "bg-muted/30 border-transparent"
                          }`}
                        >
                          <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border text-[11px] font-bold ${
                            isAnswer 
                              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-900" 
                              : "border-primary/20 bg-primary/5 text-primary"
                          }`}>
                            {label}
                          </span>
                          <div className="mt-0.5 flex-1 leading-snug">
                            <RenderMath text={opt} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {Array.isArray(q.reference) && q.reference.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 border-t border-outline-variant/30 pt-2.5">
                    {q.reference.map((ref: string, rIdx: number) => (
                      <span key={rIdx} className="px-2 py-0.5 bg-muted text-[10px] font-medium rounded text-muted-foreground">
                        🏷️ {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
