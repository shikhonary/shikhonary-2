"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";
import {
  useQuestionPaperById,
  useQuestionPaperDistributionStatuses,
  useAvailableQuestions,
  useBulkAssignQuestions,
  useAddAlternativeQuestion,
} from "@/modules/question-paper/services/use-question-paper";
import { useBuilderStore } from "../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "@workspace/ui/components/sonner";
import { QUESTION_TYPES, QUESTION_TYPE_CODES, QUESTION_TYPE_MAP, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Save,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  X,
  Split,
  Shuffle,
  Bookmark,
  BookOpen,
  Tag,
  FileText,
  ArrowUpDown,
  Check,
} from "lucide-react";
import Link from "next/link";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionGrid } from "../components/distribution-picker/question-grid";
import { useBookmarkedQuestionsStore } from "@/modules/question-bank/store/use-bookmarked-questions-store";

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

  const isAlternativeMode = searchParams.get("mode") === "alternative" || Boolean(searchParams.get("parentQuestionId"));
  const parentQuestionId = searchParams.get("parentQuestionId") || undefined;
  const orLabel = searchParams.get("orLabel") || "অথবা";
  const primaryMarksParam = searchParams.get("primaryMarks");
  const masterNumberParam = searchParams.get("masterNumber");

  const { data: paperQuery, isLoading: paperLoading } = useQuestionPaperById(paperId);
  const { data: statuses, isLoading: statusesLoading } = useQuestionPaperDistributionStatuses(paperId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("All");
  const [selectedBoard, setSelectedBoard] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const bookmarks = useBookmarkedQuestionsStore((s) => s.bookmarks);

  const { mutateAsync: bulkAssign, isPending: isAssigning } = useBulkAssignQuestions();
  const { mutateAsync: addAlternative, isPending: isAddingAlternative } = useAddAlternativeQuestion();

  const distStatus =
    statuses?.find((s: any) => s.distributionId === distributionId) ||
    (isAlternativeMode && statuses && statuses.length > 0 ? statuses[0] : null);

  const bookmarkedIds = React.useMemo(() => {
    return Object.values(bookmarks)
      .filter((b) => b.subjectId === distStatus?.subjectId)
      .map((b) => b.id);
  }, [bookmarks, distStatus?.subjectId]);

  const urlCategoryParam = (searchParams.get("category") || searchParams.get("type") || "").trim();
  const distCode = distStatus?.questionType?.code;
  const distTypeName = distStatus?.questionTypeNameBn || distStatus?.questionTypeName || distStatus?.questionType?.nameEn || distStatus?.questionType?.nameBn || distStatus?.questionTypeLabel || "";
  
  // Prioritize distribution's actual questionTypeName over urlCategoryParam (especially if url is default MCQ)
  const rawName = (urlCategoryParam && urlCategoryParam !== "MCQ")
    ? urlCategoryParam 
    : (distTypeName || urlCategoryParam);

  const normalized = 
    normalizeQuestionTypeName(distTypeName) || 
    normalizeQuestionTypeName(rawName) || 
    normalizeQuestionTypeName(distStatus?.questionType?.nameEn) || 
    normalizeQuestionTypeName(distStatus?.questionType?.nameBn);

  let category: QuestionTypeCode = QUESTION_TYPE_CODES.MCQ;
  if (isAlternativeMode && urlCategoryParam) {
    category = urlCategoryParam as QuestionTypeCode;
  } else if (normalized && QUESTION_TYPE_MAP[normalized]?.code) {
    category = QUESTION_TYPE_MAP[normalized].code as QuestionTypeCode;
  } else if (distCode && Object.values(QUESTION_TYPE_CODES).includes(distCode.toUpperCase() as QuestionTypeCode)) {
    category = distCode.toUpperCase() as QuestionTypeCode;
  } else {
    // Robust text fallback from distribution questionTypeName
    const lowerName = distTypeName.toLowerCase();
    if (lowerName.includes("form fillup") || lowerName.includes("form filling") || lowerName.includes("form fill up") || lowerName.includes("ফরম পূরণ") || lowerName.includes("ফরমপুরণ")) {
      category = QUESTION_TYPE_CODES.FORM_FILLUP;
    } else if (lowerName.includes("poem essence") || lowerName.includes("poem_essence") || lowerName.includes("কবিতার মূলভাব")) {
      category = QUESTION_TYPE_CODES.POEM_ESSENCE;
    } else if (lowerName.includes("prose essence") || lowerName.includes("prose_essence") || lowerName.includes("গদ্য অনুচ্ছেদের মূলভাব") || lowerName.includes("গদ্যের মূলভাব")) {
      category = QUESTION_TYPE_CODES.PROSE_ESSENCE;
    } else if (lowerName.includes("substitution table") || lowerName.includes("সাবস্টিটিউশন টেবিল")) {
      category = QUESTION_TYPE_CODES.SUBSTITUTION_TABLE;
    } else if (lowerName.includes("changing sentence") || lowerName.includes("changing sentences") || lowerName.includes("transformation of sentence") || lowerName.includes("change the sentence") || lowerName.includes("directed in bracket") || lowerName.includes("বাক্য রূপান্তর") || lowerName.includes("বাক্য পরিবর্তন")) {
      category = QUESTION_TYPE_CODES.CHANGING_SENTENCES;
    } else if (lowerName.includes("right form") || lowerName.includes("verbs in brackets") || lowerName.includes("correct form of verb") || lowerName.includes("ভার্ব")) {
      category = QUESTION_TYPE_CODES.RIGHT_FORM_OF_VERBS;
    } else if (lowerName.includes("without clues") || lowerName.includes("without clue") || lowerName.includes("ক্লু ছাড়া") || lowerName.includes("ক্লু ছাড়া") || lowerName.includes("ক্লু ব্যতিরেকে") || lowerName.includes("cloze test without")) {
      category = QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITHOUT_CLUES;
    } else if (lowerName.includes("fill in the blanks") || lowerName.includes("with clues") || lowerName.includes("words from the box") || lowerName.includes("from the box") || lowerName.includes("cloze test") || lowerName.includes("ক্লুসহ")) {
      category = QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITH_CLUES;
    } else if (lowerName.includes("parts of speech") || lowerName.includes("part of speech") || lowerName.includes("পদ প্রকরণ")) {
      category = QUESTION_TYPE_CODES.PARTS_OF_SPEECH;
    } else if (lowerName.includes("punctuation") || lowerName.includes("capitalization") || lowerName.includes("বিরাম চিহ্ন") || lowerName.includes("যতিচিহ্ন")) {
      category = QUESTION_TYPE_CODES.PUNCTUATION;
    } else if (lowerName.includes("pbq") || lowerName.includes("passage") || lowerName.includes("অনুচ্ছেদভিত্তিক") || lowerName.includes("বোধ পরীক্ষণ")) {
      category = QUESTION_TYPE_CODES.PBQ;
    } else if (lowerName.includes("letter") || lowerName.includes("চিঠি") || lowerName.includes("পত্র")) {
      category = QUESTION_TYPE_CODES.LETTER;
    } else if (lowerName.includes("application") || lowerName.includes("আবেদন") || lowerName.includes("দরখাস্ত")) {
      category = QUESTION_TYPE_CODES.APPLICATION;
    } else if (lowerName.includes("creative") || lowerName.includes("সৃজনশীল") || lowerName.includes("cq")) {
      category = QUESTION_TYPE_CODES.CQ;
    } else if (lowerName.includes("opposite word") || lowerName.includes("opposite_word") || lowerName.includes("বিপরীত শব্দ") || lowerName.includes("বিপরীত")) {
      category = QUESTION_TYPE_CODES.OPPOSITE_WORD;
    } else if (lowerName.includes("juktoborno") || lowerName.includes("যুক্তবর্ণ")) {
      category = QUESTION_TYPE_CODES.JUKTOBORNO;
    } else if (lowerName.includes("ek kothay") || lowerName.includes("ek kothai") || lowerName.includes("এক কথায়") || lowerName.includes("এক কথায়")) {
      category = QUESTION_TYPE_CODES.EK_KOTHAY_PROKASH;
    } else if (lowerName.includes("synonym") || lowerName.includes("সমার্থক শব্দ") || lowerName.includes("প্রতিশব্দ") || lowerName.includes("সমার্থক")) {
      category = QUESTION_TYPE_CODES.SYNONYM;
    } else if (lowerName.includes("sadhu to cholito") || lowerName.includes("sadhu") || lowerName.includes("সাধু") || lowerName.includes("চলিত")) {
      category = QUESTION_TYPE_CODES.SADHU_TO_CHOLITO;
    } else if (lowerName.includes("pod nirnoy") || lowerName.includes("pod_nirnoy") || lowerName.includes("পদ নির্ণয়") || lowerName.includes("পদ নির্ণয়")) {
      category = QUESTION_TYPE_CODES.POD_NIRNOY;
    } else if (lowerName.includes("verb tense") || lowerName.includes("verb_tense") || lowerName.includes("ক্রিয়াপদ") || lowerName.includes("ক্রিয়াপদ") || lowerName.includes("ক্রিয়ার কাল") || lowerName.includes("ক্রিয়ার কাল")) {
      category = QUESTION_TYPE_CODES.VERB_TENSE;
    } else if (lowerName.includes("word meaning") || lowerName.includes("word_meaning") || lowerName.includes("শব্দার্থ")) {
      category = QUESTION_TYPE_CODES.WORD_MEANING;
    } else if (lowerName.includes("make sentence") || lowerName.includes("make_sentence") || lowerName.includes("sentence making") || lowerName.includes("বাক্য রচনা") || lowerName.includes("বাক্য তৈরি") || lowerName.includes("বাক্য গঠন")) {
      category = QUESTION_TYPE_CODES.MAKE_SENTENCES;
    } else if (lowerName.includes("make question") || lowerName.includes("make_question") || lowerName.includes("wh question") || lowerName.includes("wh_question") || lowerName.includes("question making") || lowerName.includes("প্রশ্ন তৈরি") || lowerName.includes("প্রশ্ন গঠন")) {
      category = QUESTION_TYPE_CODES.MAKE_QUESTION;
    } else if (lowerName.includes("descriptive question") || lowerName.includes("descriptive_question") || lowerName.includes("dq") || lowerName.includes("রচনামূলক প্রশ্ন")) {
      category = QUESTION_TYPE_CODES.DESCRIPTIVE_QUESTION;
    } else if (lowerName.includes("shuddho") || lowerName.includes("shudho") || lowerName.includes("ashuddho") || lowerName.includes("শুদ্ধ") || lowerName.includes("অশুদ্ধ")) {
      category = QUESTION_TYPE_CODES.SHUDDHO_ASHUDDHO;
    } else if (lowerName.includes("dan bam") || lowerName.includes("dan_bam") || lowerName.includes("বাম-ডান") || lowerName.includes("ডান-বাম") || lowerName.includes("মিলকরণ") || lowerName.includes("matching")) {
      category = QUESTION_TYPE_CODES.DAN_BAM_MILKORON;
    } else if (lowerName.includes("short question") || lowerName.includes("short_question") || lowerName.includes("sq") || lowerName.includes("সংক্ষিপ্ত প্রশ্ন")) {
      category = QUESTION_TYPE_CODES.SHORT_QUESTION;
    } else if (lowerName.includes("short answer") || (lowerName.includes("short") && !lowerName.includes("composition")) || lowerName.includes("sa")) {
      category = QUESTION_TYPE_CODES.SA;
    } else if (lowerName.includes("essence") || lowerName.includes("সারমর্ম")) {
      category = QUESTION_TYPE_CODES.ESSENCE;
    } else if (lowerName.includes("poem") || lowerName.includes("কবিতা")) {
      category = QUESTION_TYPE_CODES.POEM;
    } else if (lowerName.includes("summary") || lowerName.includes("সারাংশ")) {
      category = QUESTION_TYPE_CODES.SUMMARY;
    }
  }

  const { data: chaptersData } = useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId: distStatus?.subjectId || "",
    }),
    enabled: Boolean(distStatus?.subjectId),
  });
  const chapters = chaptersData?.academicChapters || [];

  const { data: boardYearsData } = useQuery({
    ...trpc.questionPaper.getAvailableBoardYears.queryOptions({
      subjectId: distStatus?.subjectId || "",
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
      category,
      questionTypeId: distStatus?.questionTypeId || undefined,
    }),
    enabled: Boolean(distStatus?.subjectId),
  });
  const boardYears = boardYearsData ?? [];

  const { data: sourcesData } = useQuery({
    ...trpc.questionPaper.getAvailableSources.queryOptions({
      subjectId: distStatus?.subjectId || "",
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
      category,
      questionTypeId: distStatus?.questionTypeId || undefined,
    }),
    enabled: Boolean(distStatus?.subjectId),
  });
  const sources = sourcesData ?? [];

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

  const effectiveTargetCount = isAlternativeMode ? 1 : (urlLimit ?? distStatus.targetCount ?? 0);
  const maxSelectable = isAlternativeMode ? 1 : Math.max(0, effectiveTargetCount - subSectionQuestionsCount);

  const { data: availableData, isLoading: questionsLoading } = useAvailableQuestions(
    {
      subjectId: distStatus?.subjectId || "",
      questionTypeId: isAlternativeMode ? "" : (urlQuestionTypeIdParam || distStatus?.questionTypeId),
      category,
      search: search.trim() || undefined,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
      board: selectedBoard !== "All" ? selectedBoard : undefined,
      source: selectedSource !== "All" ? selectedSource : undefined,
      sort: selectedSort,
      excludePaperId: paperId,
      page,
      limit,
    },
    Boolean(distStatus?.subjectId)
  );

  const availableUnassigned = (availableData?.items || []).filter((q: any) => !q.isAssigned);

  const handleRandomSelect = () => {
    if (questionsLoading) return;

    if (isAlternativeMode) {
      if (availableUnassigned.length === 0) {
        toast.error("নির্বাচন করার মতো কোনো প্রশ্ন পাওয়া যায়নি।");
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableUnassigned.length);
      setSelectedIds([availableUnassigned[randomIndex].id]);
      toast.success("১টি প্রশ্ন দৈবচয়ন (Random) পদ্ধতিতে নির্বাচন করা হয়েছে!");
      return;
    }

    if (maxSelectable <= 0) {
      toast.info("এই অংশের প্রশ্নের লক্ষ্য ইতিমধ্যে পূরণ হয়ে গেছে।");
      return;
    }

    if (availableUnassigned.length === 0) {
      toast.error("নির্বাচন করার মতো কোনো প্রশ্ন পাওয়া যায়নি।");
      return;
    }

    const shuffled = [...availableUnassigned].sort(() => 0.5 - Math.random());
    const selectedCount = Math.min(maxSelectable, shuffled.length);
    const pickedIds = shuffled.slice(0, selectedCount).map((q: any) => q.id);

    setSelectedIds(pickedIds);
    toast.success(`${toBengaliDigits(pickedIds.length)}টি প্রশ্ন দৈবচয়ন (Random) পদ্ধতিতে নির্বাচন করা হয়েছে!`);
  };

  const qTypeNameEn = (distStatus.questionType?.nameEn || distStatus.questionTypeName || "").toLowerCase();
  const qTypeNameBn = (distStatus.questionType?.nameBn || distStatus.questionTypeNameBn || "").toLowerCase();
  const qTypeCode = (distStatus.questionType?.code || "").toLowerCase();
  const qTypeLabel = (distStatus.questionTypeLabel || "").toLowerCase();
  const combinedStr = `${qTypeNameEn} ${qTypeNameBn} ${qTypeCode} ${qTypeLabel}`.toLowerCase();

  const hasActiveQuery = Boolean(search && search.trim() !== "");
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All");
  const hasActiveBoard = Boolean(selectedBoard && selectedBoard !== "All");
  const hasActiveSource = Boolean(selectedSource && selectedSource !== "All");
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "newest");

  const hasAnyFilter = hasActiveQuery || hasActiveChapter || hasActiveBoard || hasActiveSource || hasActiveSort;
  const activeFilterCount = (hasActiveChapter ? 1 : 0) + (hasActiveBoard ? 1 : 0) + (hasActiveSource ? 1 : 0) + (hasActiveSort ? 1 : 0);

  const handleResetAll = () => {
    setSearch("");
    setSelectedChapterId("All");
    setSelectedBoard("All");
    setSelectedSource("All");
    setSelectedSort("newest");
    setPage(1);
  };

  const isChapterApplicable = !["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "POEM", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(category);

  const renderSelectFilters = () => (
    <>
      {/* Chapter Filter */}
      {isChapterApplicable && (
        <div className="min-w-[150px]">
          <Select
            value={selectedChapterId}
            onValueChange={(val) => {
              setSelectedChapterId(val ?? "All");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
              <SelectValue placeholder="সকল অধ্যায়" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-64 font-body">
              <SelectItem value="All">সকল অধ্যায়</SelectItem>
              {chapters.map((ch: any, idx: number) => (
                <SelectItem key={ch.id} value={ch.id}>
                  <span
                    className="font-solaiman font-semibold text-indigo-600 dark:text-indigo-400"
                    style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                  >
                    {toBengaliDigits(idx + 1)}.
                  </span>{" "}
                  {ch.nameBn || ch.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reference Filter */}
      <div className="min-w-[150px]">
        <Select
          value={selectedBoard}
          onValueChange={(val) => {
            setSelectedBoard(val ?? "All");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
            <SelectValue placeholder="সকল রেফারেন্স" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-64 font-body">
            <SelectItem value="All">সকল রেফারেন্স</SelectItem>
            {boardYears.map((item: any) => (
              <SelectItem key={item.rawRef} value={item.rawRef}>
                🏷️ {item.rawRef} ({toBengaliDigits(item.count)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source Filter */}
      {sources.length > 0 && (
        <div className="min-w-[150px]">
          <Select
            value={selectedSource}
            onValueChange={(val) => {
              setSelectedSource(val ?? "All");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
              <SelectValue placeholder="সকল উৎস" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-64 font-body">
              <SelectItem value="All">সকল উৎস</SelectItem>
              {sources.map((item: any) => (
                <SelectItem key={item.rawSource} value={item.rawSource}>
                  📚 {item.rawSource} ({toBengaliDigits(item.count)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort Filter */}
      <div className="min-w-[130px]">
        <Select
          value={selectedSort}
          onValueChange={(val: "newest" | "oldest") => {
            setSelectedSort(val ?? "newest");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card text-foreground py-2 px-3.5 text-xs font-medium outline-hidden hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors h-10 justify-between">
            <SelectValue placeholder="সাজানো" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl max-h-64 font-body">
            <SelectItem value="newest">নতুন যুক্ত</SelectItem>
            <SelectItem value="oldest">পুরাতন যুক্ত</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
  const currentDistIndex = statuses?.findIndex((s: any) => s.distributionId === distributionId) ?? -1;
  const nextDistStatus = currentDistIndex !== -1 && currentDistIndex < (statuses?.length || 0) - 1 ? statuses?.[currentDistIndex + 1] : null;

  const handleSaveAlternative = async () => {
    if (!parentQuestionId || selectedIds.length === 0) return;
    try {
      await addAlternative({
        questionPaperId: paperId,
        parentQuestionId,
        questionId: selectedIds[0]!,
        questionType: category,
        orLabel: orLabel.trim() || "অথবা",
      });
      toast.success("বিকল্প (অথবা) প্রশ্ন সফলভাবে যুক্ত করা হয়েছে!");
      router.push(`/question-papers/${paperId}/builder`);
    } catch (err: any) {
      toast.error(err?.message || "বিকল্প প্রশ্ন যোগ করতে ব্যর্থ হয়েছে");
    }
  };

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
      } else if (category === "PBQ") {
        await bulkAssign({ ...payloadBase, pbqIds: selectedIds });
      } else if (category === "PARAGRAPH") {
        await bulkAssign({ ...payloadBase, paragraphIds: selectedIds });
      } else if (category === "ESSENCE") {
        await bulkAssign({ ...payloadBase, essenceIds: selectedIds });
      } else if (category === "POEM_ESSENCE") {
        await bulkAssign({ ...payloadBase, poemEssenceIds: selectedIds });
      } else if (category === "FORM_FILLUP" || category === "FORM_FILLING") {
        await bulkAssign({ ...payloadBase, formFillupIds: selectedIds });
      } else if (category === "PROSE_ESSENCE") {
        await bulkAssign({ ...payloadBase, proseEssenceIds: selectedIds });
      } else if (category === "POEM") {
        await bulkAssign({ ...payloadBase, poemIds: selectedIds });
      } else if (category === "SUMMARY") {
        await bulkAssign({ ...payloadBase, summaryIds: selectedIds });
      } else if (category === "AMPLIFICATION") {
        await bulkAssign({ ...payloadBase, amplificationIds: selectedIds });
      } else if (category === "LETTER") {
        await bulkAssign({ ...payloadBase, letterIds: selectedIds });
      } else if (category === "APPLICATION") {
        await bulkAssign({ ...payloadBase, applicationIds: selectedIds });
      } else if (category === "NEWS_REPORT") {
        await bulkAssign({ ...payloadBase, newsReportIds: selectedIds });
      } else if (category === "ESSAY") {
        await bulkAssign({ ...payloadBase, essayIds: selectedIds });
      } else if (category === "WORD_MEANING") {
        await bulkAssign({ ...payloadBase, wordMeaningIds: selectedIds });
      } else if (category === "MAKE_SENTENCES") {
        await bulkAssign({ ...payloadBase, makeSentencesIds: selectedIds });
      } else if (category === "MAKE_QUESTION") {
        await bulkAssign({ ...payloadBase, makeQuestionIds: selectedIds });
      } else if (category === "OPPOSITE_WORD") {
        await bulkAssign({ ...payloadBase, oppositeWordIds: selectedIds });
      } else if (category === "JUKTOBORNO") {
        await bulkAssign({ ...payloadBase, juktobornoIds: selectedIds });
      } else if (category === "EK_KOTHAY_PROKASH") {
        await bulkAssign({ ...payloadBase, ekKothayProkashIds: selectedIds });
      } else if (category === "SYNONYM") {
        await bulkAssign({ ...payloadBase, synonymIds: selectedIds });
      } else if (category === "SADHU_TO_CHOLITO") {
        await bulkAssign({ ...payloadBase, sadhuToCholitoIds: selectedIds });
      } else if (category === "POD_NIRNOY") {
        await bulkAssign({ ...payloadBase, podNirnoyIds: selectedIds });
      } else if (category === "VERB_TENSE") {
        await bulkAssign({ ...payloadBase, verbTenseIds: selectedIds });
      } else if (category === "PARTS_OF_SPEECH") {
        await bulkAssign({ ...payloadBase, partsOfSpeechIds: selectedIds });
      } else if (category === "PUNCTUATION") {
        await bulkAssign({ ...payloadBase, punctuationIds: selectedIds });
      } else if (category === "SHORT_COMPOSITION") {
        await bulkAssign({ ...payloadBase, shortCompositionIds: selectedIds });
      } else if (category === "DESCRIPTIVE_QUESTION") {
        await bulkAssign({ ...payloadBase, descriptiveQuestionIds: selectedIds });
      } else if (category === "SHORT_QUESTION") {
        await bulkAssign({ ...payloadBase, shortQuestionIds: selectedIds });
      } else if (category === "SHUDDHO_ASHUDDHO") {
        await bulkAssign({ ...payloadBase, shuddhoAshuddhoIds: selectedIds });
      } else if (category === "DAN_BAM_MILKORON") {
        await bulkAssign({ ...payloadBase, danBamMilkoronIds: selectedIds });
      } else if (category === "RIGHT_FORM_OF_VERBS") {
        await bulkAssign({ ...payloadBase, rightFormOfVerbIds: selectedIds });
      } else if (category === "CHANGING_SENTENCES") {
        await bulkAssign({ ...payloadBase, changingSentenceIds: selectedIds });
      } else if (category === "FILL_IN_THE_BLANKS_WITH_CLUES") {
        await bulkAssign({ ...payloadBase, fillInTheBlanksWithCluesIds: selectedIds });
      } else if (category === "FILL_IN_THE_BLANKS_WITHOUT_CLUES") {
        await bulkAssign({ ...payloadBase, fillInTheBlanksWithoutCluesIds: selectedIds });
      } else if (category === "SUBSTITUTION_TABLE") {
        await bulkAssign({ ...payloadBase, substitutionTableIds: selectedIds });
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
    <div className="flex flex-col w-full h-full min-h-0 max-h-full overflow-hidden bg-background font-display select-none">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card shrink-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto w-full h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Left Side: Back button & Title & Target Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8.5 sm:h-9 px-2 sm:px-3 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold font-headline text-foreground cursor-pointer gap-1.5 shrink-0 shadow-2xs transition-all active:scale-95"
            >
              <Link href={`/question-papers/${paperId}/builder`} title="বিল্ডারে ফিরে যান">
                <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">বিল্ডারে ফিরুন</span>
                <span className="inline sm:hidden text-[11px]">ফিরে যান</span>
              </Link>
            </Button>

            <div className="flex flex-col justify-center min-w-0">
              <h1
                className="font-headline font-bold text-xs xs:text-sm sm:text-base text-foreground truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[240px] md:max-w-[340px] lg:max-w-lg leading-tight"
                title={
                  isAlternativeMode
                    ? `বিকল্প প্রশ্ন নির্বাচন (${orLabel})`
                    : `প্রশ্ন নির্বাচন: ${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`
                }
              >
                {isAlternativeMode
                  ? `বিকল্প প্রশ্ন নির্বাচন (${orLabel})`
                  : `${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`}
              </h1>

              {/* Target and Progress Sub-line */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAssigning || isAddingAlternative ? (
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 font-body">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span>যুক্ত করা হচ্ছে...</span>
                  </span>
                ) : isAlternativeMode ? (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/40 px-2 py-0.2 rounded-md font-headline">
                    ১টি বিকল্প প্রশ্ন নির্বাচন করুন
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-body flex items-center gap-1">
                    <span>টার্গেট: <strong className="text-foreground font-headline">{toBengaliDigits(effectiveTargetCount)}টি</strong></span>
                    <span>•</span>
                    <span>যুক্ত: <strong className="text-indigo-600 dark:text-indigo-400 font-headline">{toBengaliDigits(subSectionQuestionsCount)}টি</strong></span>
                    {selectedIds.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-headline font-semibold">
                          +{toBengaliDigits(selectedIds.length)}টি নির্বাচিত
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Random Select Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomSelect}
              disabled={questionsLoading || availableUnassigned.length === 0}
              className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground hover:bg-muted/80 cursor-pointer flex items-center gap-1.5 font-headline shrink-0 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              title="প্রশ্নসমূহ থেকে দৈবচয়ন (Random) পদ্ধতিতে নির্বাচন করুন"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">র‍্যান্ডম নির্বাচন</span>
              <span className="sm:hidden text-[11px]">র‍্যান্ডম</span>
            </Button>

            {/* Next Sub-Section Button (if not alternative mode and next exists) */}
            {!isAlternativeMode && nextDistStatus && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 dark:border-white/10 text-xs font-bold text-foreground hover:bg-muted/80 cursor-pointer flex items-center gap-1.5 font-headline shrink-0 shadow-2xs transition-all active:scale-95"
              >
                <Link href={`/question-papers/${paperId}/distributions/${nextDistStatus.distributionId}/pick`}>
                  <span className="hidden md:inline">পরবর্তী উপ-বিভাগ</span>
                  <span className="md:hidden text-[11px]">পরবর্তী</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-muted-foreground" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sub-Header Filter Bar directly attached under Header with ZERO gap */}
      <div className="bg-card border-b border-border shrink-0 z-30 shadow-2xs px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-2.5">
          {/* Primary Filter Row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Filter */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="প্রশ্ন বা বিষয় দিয়ে অনুসন্ধান করুন..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-9 h-10 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500/50 transition-all font-body"
              />
              {hasActiveQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-foreground rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="অনুসন্ধান মুছুন"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bookmarked Filter Pill */}
            <button
              type="button"
              onClick={() => {
                setOnlyBookmarked(!onlyBookmarked);
                setPage(1);
              }}
              className={`h-10 px-3 sm:px-3.5 rounded-xl border inline-flex items-center gap-1.5 text-xs font-bold font-headline transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs ${
                onlyBookmarked
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-card border-slate-200 dark:border-white/[0.08] text-foreground hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              }`}
              title="বুকমার্ককৃত প্রশ্ন ফিল্টার"
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-white text-white" : "fill-rose-500 text-rose-500"}`} />
              <span className="hidden sm:inline">বুকমার্ককৃত</span>
              <span className="text-[11px] font-semibold">({toBengaliDigits(bookmarkedIds.length)})</span>
            </button>

            {/* Mobile Filter Sheet Trigger Button & Content */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={`md:hidden h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-body transition-all shrink-0 cursor-pointer active:scale-95 ${
                    activeFilterCount > 0
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-card border-border/60 text-foreground hover:bg-muted/60 shadow-2xs"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ফিল্টার</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4.5 h-4.5 rounded-full bg-white text-indigo-700 text-[10px] font-bold flex items-center justify-center ml-0.5">
                      {toBengaliDigits(activeFilterCount)}
                    </span>
                  )}
                </button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="rounded-t-3xl max-h-[88vh] flex flex-col p-0 border-t border-border/50 bg-card text-foreground shadow-2xl focus:outline-hidden overflow-hidden"
              >
                {/* Grab Handle */}
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto mt-3 mb-1 shrink-0" />

                {/* Sheet Header */}
                <SheetHeader className="px-4 py-3 border-b border-border/40 text-left shrink-0">
                  <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>ফিল্টারসমূহ</span>
                          {activeFilterCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                              {toBengaliDigits(activeFilterCount)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-normal text-muted-foreground font-body leading-none mt-0.5">
                          {activeFilterCount > 0
                            ? `${toBengaliDigits(activeFilterCount)}টি ফিল্টার সক্রিয় রয়েছে`
                            : "পছন্দমতো ফিল্টার নির্বাচন করুন"}
                        </p>
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-body cursor-pointer transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>সব মুছুন</span>
                      </button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                {/* Sheet Body */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 font-body text-xs">
                  {/* Active Filter Chips Strip inside Drawer */}
                  {activeFilterCount > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pb-2 border-b border-border/40">
                      <span className="text-[10px] font-semibold text-muted-foreground">সক্রিয়:</span>
                      {hasActiveChapter && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                          <span>অধ্যায়: {chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn || chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn}</span>
                          <button
                            type="button"
                            onClick={() => { setSelectedChapterId("All"); setPage(1); }}
                            className="hover:opacity-75 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {hasActiveBoard && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                          <span>রেফারেন্স: {selectedBoard}</span>
                          <button
                            type="button"
                            onClick={() => { setSelectedBoard("All"); setPage(1); }}
                            className="hover:opacity-75 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {hasActiveSource && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                          <span>উৎস: {selectedSource}</span>
                          <button
                            type="button"
                            onClick={() => { setSelectedSource("All"); setPage(1); }}
                            className="hover:opacity-75 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {hasActiveSort && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/60">
                          <span>সাজানো: {selectedSort === "newest" ? "নতুন যুক্ত" : "পুরাতন যুক্ত"}</span>
                          <button
                            type="button"
                            onClick={() => { setSelectedSort("newest"); setPage(1); }}
                            className="hover:opacity-75 cursor-pointer ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Chapter Filter in Sheet */}
                  {isChapterApplicable && chapters.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>অধ্যায় নির্বাচন</span>
                        </label>
                        {hasActiveChapter && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <Select
                        value={selectedChapterId}
                        onValueChange={(val) => {
                          setSelectedChapterId(val ?? "All");
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                          <div className="flex items-center gap-2 truncate pl-1">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="সকল অধ্যায়" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-64 font-body">
                          <SelectItem value="All">সকল অধ্যায়</SelectItem>
                          {chapters.map((ch: any, idx: number) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              <span
                                className="font-solaiman font-semibold text-indigo-600 dark:text-indigo-400"
                                style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                              >
                                {toBengaliDigits(idx + 1)}.
                              </span>{" "}
                              {ch.nameBn || ch.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Reference / Board in Sheet */}
                  {boardYears.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>রেফারেন্স / বোর্ড</span>
                        </label>
                        {hasActiveBoard && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <Select
                        value={selectedBoard}
                        onValueChange={(val) => {
                          setSelectedBoard(val ?? "All");
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                          <div className="flex items-center gap-2 truncate pl-1">
                            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="সকল রেফারেন্স" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-64 font-body">
                          <SelectItem value="All">সকল রেফারেন্স</SelectItem>
                          {boardYears.map((item: any) => (
                            <SelectItem key={item.rawRef} value={item.rawRef}>
                              🏷️ {item.rawRef} ({toBengaliDigits(item.count)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Source in Sheet */}
                  {sources.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>উৎস</span>
                        </label>
                        {hasActiveSource && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <Select
                        value={selectedSource}
                        onValueChange={(val) => {
                          setSelectedSource(val ?? "All");
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-indigo-500">
                          <div className="flex items-center gap-2 truncate pl-1">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="সকল উৎস" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-64 font-body">
                          <SelectItem value="All">সকল উৎস</SelectItem>
                          {sources.map((item: any) => (
                            <SelectItem key={item.rawSource} value={item.rawSource}>
                              📚 {item.rawSource} ({toBengaliDigits(item.count)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sort Order in Sheet */}
                  <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-foreground flex items-center gap-2">
                        <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>ক্রমবিন্যাস</span>
                      </label>
                      {hasActiveSort && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                          সক্রিয়
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedSort("newest"); setPage(1); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                          selectedSort === "newest"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                        }`}
                      >
                        নতুন যুক্ত আগে
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedSort("oldest"); setPage(1); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                          selectedSort === "oldest"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                        }`}
                      >
                        পুরাতন যুক্ত আগে
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="px-3.5 py-3 bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center gap-2.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetAll}
                    disabled={activeFilterCount === 0}
                    className="h-11 px-4 rounded-xl font-bold flex items-center gap-1.5 border-border text-foreground shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>রিসেট</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>ফলাফল দেখুন</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filters (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              {renderSelectFilters()}
            </div>
          </div>

          {/* Active Filter Badges & Reset Row */}
          {hasAnyFilter && (
            <div className="flex flex-col gap-2 rounded-xl bg-slate-50/70 dark:bg-muted/30 border border-slate-200/60 dark:border-white/[0.04] p-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-slate-500 dark:text-muted-foreground text-[11px] sm:text-xs font-headline">
                  সক্রিয় ফিল্টারসমূহ:
                </span>

                {/* Search Query Badge */}
                {hasActiveQuery && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal max-w-[220px] truncate font-body"
                  >
                    <span className="truncate">অনুসন্ধান: &quot;{search}&quot;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="অনুসন্ধান ফিল্টার বাদ দিন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Chapter Filter Badge */}
                {hasActiveChapter && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
                  >
                    <span>অধ্যায়: {chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn || chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterId("All");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="অধ্যায় ফিল্টার বাদ দিন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Reference Filter Badge */}
                {hasActiveBoard && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
                  >
                    <span>রেফারেন্স: {selectedBoard}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBoard("All");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="রেফারেন্স ফিল্টার বাদ দিন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Source Filter Badge */}
                {hasActiveSource && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
                  >
                    <span>উৎস: {selectedSource}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSource("All");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="উৎস ফিল্টার বাদ দিন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}

                {/* Sort Filter Badge */}
                {hasActiveSort && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-default normal-case tracking-normal shrink-0 font-body"
                  >
                    <span>সাজানো: {selectedSort === "oldest" ? "পুরাতন যুক্ত" : "নতুন যুক্ত"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSort("newest");
                        setPage(1);
                      }}
                      className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="ক্রম পরিবর্তন বাদ দিন"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>

              {/* Reset All Button */}
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer self-end sm:self-auto shrink-0 font-body"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার মুছুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6 pb-28">

          {/* Alternative Mode Notification Banner */}
          {isAlternativeMode && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>বিকল্প প্রশ্ন নির্বাচন মোড</span>
                    <Badge className="bg-primary text-white text-[10px] py-0 px-2">
                      {orLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {masterNumberParam ? `প্রশ্ন নং ${toBengaliDigits(masterNumberParam)}-এর জন্য ` : ""}
                    বিকল্প হিসেবে ১টি প্রশ্ন নির্বাচন করুন।
                    {primaryMarksParam ? ` (মান: ${toBengaliDigits(primaryMarksParam)})` : ""}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-xs border-primary/40 text-primary hover:bg-primary/15 cursor-pointer shrink-0 rounded-lg font-bold"
              >
                <Link href={`/question-papers/${paperId}/builder`}>
                  বাতিল ও ক্যানভাসে ফিরুন
                </Link>
              </Button>
            </div>
          )}



          {/* Question Grid */}
          <QuestionGrid
            subjectId={distStatus.subjectId}
            questionTypeId={isAlternativeMode ? "" : (urlQuestionTypeIdParam || distStatus.questionTypeId)}
            category={category}
            search={search}
            chapterId={selectedChapterId}
            board={selectedBoard}
            source={selectedSource}
            sort={selectedSort}
            excludePaperId={paperId}
            selectedIds={selectedIds}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onlyBookmarked={onlyBookmarked}
            bookmarkedIds={bookmarkedIds}
            onToggle={(id) => {
              setSelectedIds(prev => {
                if (prev.includes(id)) {
                  return [];
                }
                if (isAlternativeMode) {
                  return [id];
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
        <div className="fixed bottom-4 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl md:rounded-full p-2.5 md:px-6 md:py-2.5 flex flex-col md:flex-row items-center gap-2 md:gap-5 z-50 animate-in slide-in-from-bottom-5 select-none">
          <div className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between w-full md:w-auto px-1 md:px-0">
            <span>
              <span className="text-indigo-600 dark:text-indigo-400 font-headline font-black">{toBengaliDigits(selectedIds.length)}টি</span> প্রশ্ন নির্বাচিত
            </span>
            <span className="text-muted-foreground md:ml-2 font-normal text-[11px] md:text-xs">
              (প্রয়োজন: {toBengaliDigits(maxSelectable)}টি)
            </span>
          </div>
          {isAlternativeMode ? (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 border-border text-muted-foreground hover:bg-muted font-headline font-bold cursor-pointer text-xs px-4"
                asChild
              >
                <Link href={`/question-papers/${paperId}/builder`}>
                  বাতিল
                </Link>
              </Button>
              <Button
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold cursor-pointer gap-1.5 text-xs px-5 shrink-0 shadow-xs transition-all active:scale-95"
                disabled={isAddingAlternative}
                onClick={handleSaveAlternative}
              >
                {isAddingAlternative ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Split className="w-3.5 h-3.5" />}
                <span>বিকল্প প্রশ্ন হিসেবে যুক্ত করুন</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                className="w-full md:w-auto rounded-xl md:rounded-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold cursor-pointer gap-1.5 text-xs px-5 shrink-0 shadow-xs transition-all active:scale-95"
                disabled={isAssigning}
                onClick={() => handleSaveAndContinue(false)}
              >
                {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>সংরক্ষণ ও বিল্ডারে ফিরে যান</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
