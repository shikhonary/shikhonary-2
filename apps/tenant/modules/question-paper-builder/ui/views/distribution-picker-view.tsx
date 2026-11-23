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
  useReplaceQuestion,
} from "@/modules/question-paper/services/use-question-paper";
import { useBuilderStore } from "../../store/use-builder-store";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { QUESTION_TYPES, QUESTION_TYPE_CODES, QUESTION_TYPE_MAP, normalizeQuestionTypeName, getQuestionTypePolicy, isSingleQuestionType, resolvePaperSlots, MCQ_TYPE_OPTIONS, type QuestionTypeCode } from "@workspace/utils";
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
  ChevronRight,
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
  ArrowLeftRight,
  HelpCircle,
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

  const isExchangeMode = searchParams.get("mode") === "exchange";
  const questionPaperQuestionId = searchParams.get("questionPaperQuestionId") || undefined;
  const currentQuestionId = searchParams.get("currentQuestionId") || undefined;

  const { data: paperQuery, isLoading: paperLoading } = useQuestionPaperById(paperId);
  const { data: statuses, isLoading: statusesLoading } = useQuestionPaperDistributionStatuses(paperId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSubQuestionIdsMap, setSelectedSubQuestionIdsMap] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // 500ms Debounce to give ample time while typing phrases before fetching
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Global Keyboard Shortcut: Ctrl+K or / to quickly focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA" && !target.isContentEditable) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [selectedChapterId, setSelectedChapterId] = useState<string>("All");
  const [selectedBoard, setSelectedBoard] = useState<string>("All");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<"newest" | "oldest">("newest");
  const [selectedMcqType, setSelectedMcqType] = useState<string>("All");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const bookmarks = useBookmarkedQuestionsStore((s) => s.bookmarks);

  const { mutateAsync: bulkAssign, isPending: isAssigning } = useBulkAssignQuestions();
  const { mutateAsync: addAlternative, isPending: isAddingAlternative } = useAddAlternativeQuestion();
  const { mutateAsync: replaceQuestion, isPending: isReplacing } = useReplaceQuestion();

  const distStatus =
    statuses?.find((s: any) => s.distributionId === distributionId) ||
    ((isAlternativeMode || isExchangeMode) && statuses && statuses.length > 0 ? statuses[0] : null);

  const bookmarkedIds = React.useMemo(() => {
    return Object.values(bookmarks)
      .filter((b) => b.subjectId === distStatus?.subjectId)
      .map((b) => b.id);
  }, [bookmarks, distStatus?.subjectId]);

  const handleToggleSubQuestion = (passageId: string, subQuestionId: string, allSubIds: string[]) => {
    setSelectedSubQuestionIdsMap((prev) => {
      const currentList = prev[passageId] !== undefined ? prev[passageId] : allSubIds;
      const exists = currentList.includes(subQuestionId);
      const updated = exists ? currentList.filter((id) => id !== subQuestionId) : [...currentList, subQuestionId];

      if (updated.length === 0) {
        setSelectedIds((prevIds) => prevIds.filter((id) => id !== passageId));
        const nextMap = { ...prev };
        delete nextMap[passageId];
        return nextMap;
      }

      setSelectedIds((prevIds) => (prevIds.includes(passageId) ? prevIds : [...prevIds, passageId]));
      return { ...prev, [passageId]: updated };
    });
  };

  const handleSelectGroup = (passageId: string, groupSubIds: string[], allSubIds: string[]) => {
    setSelectedSubQuestionIdsMap((prev) => {
      const isCardSelected = selectedIds.includes(passageId);
      const currentList = isCardSelected
        ? (prev[passageId] !== undefined ? prev[passageId] : allSubIds)
        : [];

      const isAllGroupSelected =
        groupSubIds.length > 0 && groupSubIds.every((id) => currentList.includes(id));

      let updated: string[];
      if (isAllGroupSelected) {
        // Toggle OFF: remove this group's IDs
        updated = currentList.filter((id) => !groupSubIds.includes(id));
      } else {
        // Toggle ON: add missing group IDs
        const toAdd = groupSubIds.filter((id) => !currentList.includes(id));
        updated = [...currentList, ...toAdd];
      }

      if (updated.length === 0) {
        setSelectedIds((prevIds) => prevIds.filter((id) => id !== passageId));
        const nextMap = { ...prev };
        delete nextMap[passageId];
        return nextMap;
      }

      setSelectedIds((prevIds) => (prevIds.includes(passageId) ? prevIds : [...prevIds, passageId]));
      return { ...prev, [passageId]: updated };
    });
  };

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
  if ((isAlternativeMode || isExchangeMode) && urlCategoryParam) {
    category = urlCategoryParam as QuestionTypeCode;
  } else if (normalized && QUESTION_TYPE_MAP[normalized]?.code) {
    category = QUESTION_TYPE_MAP[normalized].code as QuestionTypeCode;
  } else if (distCode && Object.values(QUESTION_TYPE_CODES).includes(distCode.toUpperCase() as QuestionTypeCode)) {
    category = distCode.toUpperCase() as QuestionTypeCode;
  } else {
    // Robust text fallback from distribution questionTypeName
    const lowerName = distTypeName.toLowerCase();
    if (lowerName.includes("seen comprehension 2") || lowerName.includes("seen_comprehension_2") || lowerName.includes("seen 2") || lowerName.includes("সীন কম্প্রিহেনশন ২") || lowerName.includes("সীন ২")) {
      category = QUESTION_TYPE_CODES.SEEN_COMPREHENSION_2;
    } else if (lowerName.includes("seen comprehension") || lowerName.includes("seen_comprehension") || lowerName.includes("seen 1") || lowerName.includes("সীন কম্প্রিহেনশন") || lowerName.includes("সীন ১") || lowerName.includes("সীন")) {
      category = QUESTION_TYPE_CODES.SEEN_COMPREHENSION_1;
    } else if (lowerName.includes("form fillup") || lowerName.includes("form filling") || lowerName.includes("form fill up") || lowerName.includes("ফরম পূরণ") || lowerName.includes("ফরমপুরণ")) {
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
    } else if (lowerName.includes("gender change") || lowerName.includes("gender_change") || lowerName.includes("লিঙ্গ পরিবর্তন") || lowerName.includes("লিঙ্গান্তর") || lowerName.includes("লিঙ্গ")) {
      category = QUESTION_TYPE_CODES.GENDER_CHANGE;
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
    } else if (lowerName.includes("number in word") || lowerName.includes("numbers in word") || lowerName.includes("কথায় লেখ") || lowerName.includes("কথায় লেখা") || lowerName.includes("সংখ্যা কথায়") || lowerName.includes("সংখ্যা কথায়")) {
      category = QUESTION_TYPE_CODES.NUMBER_IN_WORDS;
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
    } else if (lowerName.includes("rearrange") || lowerName.includes("পুনর্বিন্যাস") || lowerName.includes("সাজিয়ে লেখ") || lowerName.includes("সাজিয়ে লেখ")) {
      category = QUESTION_TYPE_CODES.REARRANGE;
    } else if (lowerName.includes("short question") || lowerName.includes("short_question") || lowerName.includes("sq") || lowerName.includes("সংক্ষিপ্ত প্রশ্ন")) {
      category = QUESTION_TYPE_CODES.SHORT_QUESTION;
    } else if (lowerName.includes("math question") || lowerName.includes("math_question") || lowerName.includes("গণিত প্রশ্ন") || lowerName.includes("গণিত") || lowerName.includes("math")) {
      category = QUESTION_TYPE_CODES.MATH_QUESTION;
    } else if (lowerName.includes("grammar question") || lowerName.includes("grammar_question") || lowerName.includes("ব্যাকরণ প্রশ্ন") || lowerName.includes("ব্যাকরণ")) {
      category = QUESTION_TYPE_CODES.GRAMMAR_QUESTION;
    } else if (lowerName.includes("short answer") || (lowerName.includes("short") && !lowerName.includes("composition")) || lowerName.includes("sa")) {
      category = QUESTION_TYPE_CODES.SA;
    } else if (lowerName.includes("essence") || lowerName.includes("সারমর্ম")) {
      category = QUESTION_TYPE_CODES.ESSENCE;
    } else if (lowerName.includes("poem") || lowerName.includes("কবিতা")) {
      category = QUESTION_TYPE_CODES.POEM;
    } else if (lowerName.includes("thought expansion") || lowerName.includes("thought_expansion") || lowerName.includes("ভাব-সম্প্রসারণ") || lowerName.includes("ভাবসম্প্রসারণ")) {
      category = QUESTION_TYPE_CODES.THOUGHT_EXPANSION;
    } else if (lowerName.includes("amplification")) {
      category = QUESTION_TYPE_CODES.AMPLIFICATION;
    } else if (lowerName.includes("summary") || lowerName.includes("সারাংশ")) {
      category = QUESTION_TYPE_CODES.SUMMARY;
    }
  }

  const { data: chaptersData } = useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId: distStatus?.subjectId || "",
      isActive: true,
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

  const resolvedSlot = React.useMemo(() => {
    if (!paperQuery) return null;
    const topology = resolvePaperSlots(paperQuery, statuses ?? []);
    return topology.findSlot({
      distributionId,
      subSectionId: urlSubSectionId ?? (distStatus as any)?.subSectionId ?? null,
      sectionId: urlSectionId ?? (distStatus as any)?.sectionId ?? null,
    });
  }, [paperQuery, statuses, distributionId, urlSubSectionId, urlSectionId, distStatus]);

  const subSectionQuestionsCount = resolvedSlot
    ? resolvedSlot.slotAddedCount
    : (urlSubSectionId
        ? (paperQuery?.questions || []).filter((q: any) => q.subSectionId === urlSubSectionId && q.distributionId === distributionId).length
        : (urlSectionId
          ? (paperQuery?.questions || []).filter((q: any) => q.sectionId === urlSectionId && q.distributionId === distributionId).length
          : (distStatus?.addedCount || 0)));

  const policy = getQuestionTypePolicy(category || distStatus?.questionType?.code || distStatus?.questionTypeName);
  const resolvedLimit = resolvedSlot?.slotPickLimit ?? urlLimit ?? distStatus?.targetCount ?? 1;
  const isSingleType = policy.selectionMode === "SINGLE" && resolvedLimit <= 1;

  const effectiveTargetCount = (isAlternativeMode || isExchangeMode)
    ? 1
    : (isSingleType ? 1 : (resolvedSlot?.slotPickLimit ?? urlLimit ?? distStatus?.targetCount ?? 0));
  const maxSelectable = (isAlternativeMode || isExchangeMode)
    ? 1
    : (isSingleType
        ? Math.max(0, 1 - subSectionQuestionsCount)
        : Math.max(0, effectiveTargetCount - subSectionQuestionsCount));

  const { data: availableData, isLoading: questionsLoading } = useAvailableQuestions(
    {
      subjectId: distStatus?.subjectId || "",
      questionTypeId: isAlternativeMode ? "" : (urlQuestionTypeIdParam || distStatus?.questionTypeId),
      category,
      search: debouncedSearch.trim() || undefined,
      chapterId: selectedChapterId !== "All" ? selectedChapterId : undefined,
      board: selectedBoard !== "All" ? selectedBoard : undefined,
      source: selectedSource !== "All" ? selectedSource : undefined,
      sort: selectedSort,
      mcqType: selectedMcqType !== "All" ? selectedMcqType : undefined,
      excludePaperId: paperId,
      page,
      limit,
    },
    Boolean(distStatus?.subjectId)
  );

  const availableUnassigned = (availableData?.items || []).filter((q: any) => !q.isAssigned);
  const availableForExchange = (availableData?.items || []).filter((q: any) => q.id !== currentQuestionId);
  const exchangePool = availableForExchange.length > 0 ? availableForExchange : (availableData?.items || []);

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

  const handleRandomSelect = () => {
    if (questionsLoading) return;

    if (isExchangeMode) {
      if (exchangePool.length === 0) {
        toast.error("সিলেক্ট করার মতো কোনো প্রশ্ন পাওয়া যায়নি");
        return;
      }
      const randomIndex = Math.floor(Math.random() * exchangePool.length);
      setSelectedIds([exchangePool[randomIndex].id]);
      toast.success("১টি প্রশ্ন র‍্যান্ডমভাবে সিলেক্ট করা হয়েছে!");
      return;
    }

    if (isAlternativeMode) {
      if (availableUnassigned.length === 0) {
        toast.error("সিলেক্ট করার মতো কোনো প্রশ্ন পাওয়া যায়নি");
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableUnassigned.length);
      setSelectedIds([availableUnassigned[randomIndex].id]);
      toast.success("১টি প্রশ্ন র‍্যান্ডমভাবে সিলেক্ট করা হয়েছে!");
      return;
    }

    if (isSingleType) {
      if (subSectionQuestionsCount >= 1) {
        toast.info("এই সেকশনে ১টি মূল প্রশ্ন ইতিমধ্যে যোগ করা হয়েছে। বিকল্প প্রশ্ন যোগ করতে বিল্ডারের অথবা অপশন ব্যবহার করুন।");
        return;
      }
      if (availableUnassigned.length === 0) {
        toast.error("সিলেক্ট করার মতো কোনো প্রশ্ন পাওয়া যায়নি");
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableUnassigned.length);
      setSelectedIds([availableUnassigned[randomIndex].id]);
      toast.success("১টি প্রশ্ন র‍্যান্ডমভাবে সিলেক্ট করা হয়েছে!");
      return;
    }

    if (maxSelectable <= 0) {
      toast.info("এই সেকশনের প্রশ্নের টার্গেট ইতিমধ্যে পূর্ণ হয়ে গেছে।");
      return;
    }

    if (availableUnassigned.length === 0) {
      toast.error("সিলেক্ট করার মতো কোনো প্রশ্ন পাওয়া যায়নি");
      return;
    }

    const shuffled = [...availableUnassigned].sort(() => 0.5 - Math.random());
    const selectedCount = Math.min(maxSelectable, shuffled.length);
    const pickedIds = shuffled.slice(0, selectedCount).map((q: any) => q.id);

    setSelectedIds(pickedIds);
    toast.success(`${toBengaliDigits(pickedIds.length)}টি প্রশ্ন র‍্যান্ডমভাবে সিলেক্ট করা হয়েছে!`);
  };

  const qTypeNameEn = (distStatus.questionType?.nameEn || distStatus.questionTypeName || "").toLowerCase();
  const qTypeNameBn = (distStatus.questionType?.nameBn || distStatus.questionTypeNameBn || "").toLowerCase();
  const qTypeCode = (distStatus.questionType?.code || "").toLowerCase();
  const qTypeLabel = (distStatus.questionTypeLabel || "").toLowerCase();
  const combinedStr = `${qTypeNameEn} ${qTypeNameBn} ${qTypeCode} ${qTypeLabel}`.toLowerCase();

  const isMcqCategory = category === "MCQ";
  const hasActiveQuery = Boolean(search && search.trim() !== "");
  const hasActiveChapter = Boolean(selectedChapterId && selectedChapterId !== "All");
  const hasActiveMcqType = isMcqCategory && Boolean(selectedMcqType && selectedMcqType !== "All");
  const hasActiveBoard = Boolean(selectedBoard && selectedBoard !== "All");
  const hasActiveSource = Boolean(selectedSource && selectedSource !== "All");
  const hasActiveSort = Boolean(selectedSort && selectedSort !== "newest");
  const hasActiveBookmarked = Boolean(onlyBookmarked);

  const hasAnyFilter = hasActiveBookmarked || hasActiveChapter || hasActiveMcqType || hasActiveBoard || hasActiveSource || hasActiveSort || hasActiveQuery;
  const activeFilterCount =
    (hasActiveBookmarked ? 1 : 0) +
    (hasActiveChapter ? 1 : 0) +
    (hasActiveMcqType ? 1 : 0) +
    (hasActiveBoard ? 1 : 0) +
    (hasActiveSource ? 1 : 0) +
    (hasActiveSort ? 1 : 0) +
    (hasActiveQuery ? 1 : 0);

  const handleResetAll = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedChapterId("All");
    setSelectedBoard("All");
    setSelectedSource("All");
    setSelectedSort("newest");
    setSelectedMcqType("All");
    setOnlyBookmarked(false);
    setPage(1);
  };

  const isChapterApplicable = !["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "POEM", "THOUGHT_EXPANSION", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(category);

  const currentDistIndex = statuses?.findIndex((s: any) => s.distributionId === distributionId) ?? -1;
  const nextDistStatus = currentDistIndex !== -1 && currentDistIndex < (statuses?.length || 0) - 1 ? statuses?.[currentDistIndex + 1] : null;

  const handleSaveExchange = async () => {
    if (!questionPaperQuestionId || selectedIds.length === 0) return;
    try {
      const res: any = await replaceQuestion({
        questionPaperId: paperId,
        questionPaperQuestionId,
        newQuestionId: selectedIds[0]!,
        questionType: category,
      });
      if (res?.ok === false) {
        toast.error(res.message || "প্রশ্ন পরিবর্তন করা যায়নি");
        return;
      }
      toast.success("প্রশ্নটি সফলভাবে পরিবর্তন করা হয়েছে!");
      router.push(`/question-papers/${paperId}/builder`);
    } catch (err: any) {
      toast.error(err?.message || "প্রশ্ন পরিবর্তন করা যায়নি");
    }
  };

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
      } else if (category === "THOUGHT_EXPANSION") {
        await bulkAssign({ ...payloadBase, thoughtExpansionIds: selectedIds });
      } else if (category === "LETTER") {
        await bulkAssign({ ...payloadBase, letterIds: selectedIds });
      } else if (category === "APPLICATION") {
        await bulkAssign({ ...payloadBase, applicationIds: selectedIds });
      } else if (category === "NEWS_REPORT") {
        await bulkAssign({ ...payloadBase, newsReportIds: selectedIds });
      } else if (category === "ESSAY") {
        await bulkAssign({ ...payloadBase, essayIds: selectedIds });
      } else if (category === "NUMBER_IN_WORDS") {
        await bulkAssign({ ...payloadBase, numberInWordsIds: selectedIds });
      } else if (category === "WORD_MEANING") {
        await bulkAssign({ ...payloadBase, wordMeaningIds: selectedIds });
      } else if (category === "MAKE_SENTENCES") {
        await bulkAssign({ ...payloadBase, makeSentencesIds: selectedIds });
      } else if (category === "MAKE_QUESTION") {
        await bulkAssign({ ...payloadBase, makeQuestionIds: selectedIds });
      } else if (category === "OPPOSITE_WORD") {
        await bulkAssign({ ...payloadBase, oppositeWordIds: selectedIds });
      } else if (category === "GENDER_CHANGE") {
        await bulkAssign({ ...payloadBase, genderChangeIds: selectedIds });
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
      } else if (category === "REARRANGE") {
        await bulkAssign({ ...payloadBase, rearrangeIds: selectedIds });
      } else if (category === "MATH_QUESTION") {
        await bulkAssign({ ...payloadBase, mathQuestionIds: selectedIds });
      } else if (category === "GRAMMAR_QUESTION") {
        await bulkAssign({ ...payloadBase, grammarQuestionIds: selectedIds });
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
      } else if (category === "SEEN_COMPREHENSION_1" || category === "SEEN_COMPREHENSION_2") {
        const seenComprehensionItems = selectedIds.map((id) => ({
          id,
          selectedSubQuestionIds: selectedSubQuestionIdsMap[id] || [],
        }));
        await bulkAssign({ ...payloadBase, seenComprehensionItems });
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
      {/* Top Header */}
      <header className="h-14 sm:h-16 border-b border-border/80 bg-card/95 backdrop-blur-md shrink-0 z-40 shadow-2xs w-full">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Side: Back button, Breadcrumb & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-8.5 w-8.5 sm:h-9 sm:w-9 rounded-xl border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Link href={`/question-papers/${paperId}/builder`} title="বিল্ডারে ফিরে যান">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>

            <div className="h-6 w-px bg-border/60 shrink-0 hidden sm:block" />

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href={`/question-papers/${paperId}/builder`}
                  className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-body shrink-0 truncate max-w-[130px]"
                  title="বিল্ডারে ফিরে যান"
                >
                  <span className="font-semibold">বিল্ডার</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                </Link>

                <h1
                  className="font-headline font-bold text-xs xs:text-sm sm:text-base text-foreground truncate max-w-[190px] xs:max-w-[230px] sm:max-w-[300px] md:max-w-[340px] lg:max-w-md leading-tight"
                  title={
                    isExchangeMode
                      ? `প্রশ্ন পরিবর্তন: ${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`
                      : isAlternativeMode
                      ? `বিকল্প প্রশ্ন যোগ (${orLabel})`
                      : `${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`
                  }
                >
                  {isExchangeMode
                    ? `প্রশ্ন পরিবর্তন: ${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`
                    : isAlternativeMode
                    ? `বিকল্প প্রশ্ন যোগ (${orLabel})`
                    : `${distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName}`}
                </h1>

                {isExchangeMode ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/50 text-[10px] font-bold font-headline shrink-0">
                    <ArrowLeftRight className="w-2.5 h-2.5" />
                    পরিবর্তন মোড
                  </span>
                ) : isAlternativeMode ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-[10px] font-bold font-headline shrink-0">
                    <Split className="w-2.5 h-2.5" />
                    {orLabel}
                  </span>
                ) : null}
              </div>

              {/* Mobile Target Sub-line (hidden on md+) */}
              <div className="flex md:hidden items-center gap-1.5 mt-0.5">
                {isAssigning || isAddingAlternative || isReplacing ? (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-body">
                    <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                    <span>{isReplacing ? "পরিবর্তন হচ্ছে..." : "যুক্ত করা হচ্ছে..."}</span>
                  </span>
                ) : isExchangeMode ? (
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 font-body">
                    {masterNumberParam ? `প্রশ্ন নং ${toBengaliDigits(masterNumberParam)} ` : ""}পরিবর্তন মোড
                  </span>
                ) : isAlternativeMode ? (
                  <span className="text-[10px] font-medium text-primary font-body">
                    ১টি বিকল্প প্রশ্ন সিলেক্ট করুন
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                    <span>যুক্ত: <strong className="text-foreground font-headline">{toBengaliDigits(subSectionQuestionsCount)}/{toBengaliDigits(effectiveTargetCount)}টি</strong></span>
                    {selectedIds.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-headline font-semibold">
                        (+{toBengaliDigits(selectedIds.length)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center: Visual Target Progress Pill (Desktop / Tablet) */}
          {!isAlternativeMode && !isExchangeMode ? (
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-muted/30 dark:bg-white/[0.03] border border-border/60 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 font-body">
                <span className="text-[11px] text-muted-foreground">টার্গেট পূরণ:</span>
                <span className="font-bold text-foreground font-headline">
                  {toBengaliDigits(subSectionQuestionsCount)}/{toBengaliDigits(effectiveTargetCount)}টি
                </span>
              </div>

              {/* Progress mini meter bar */}
              <div className="w-16 lg:w-20 h-2 rounded-full bg-muted/80 dark:bg-white/10 overflow-hidden relative">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    subSectionQuestionsCount >= effectiveTargetCount && effectiveTargetCount > 0
                      ? "bg-emerald-500"
                      : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(100, Math.round((subSectionQuestionsCount / (effectiveTargetCount || 1)) * 100))}%`,
                  }}
                />
              </div>

              {selectedIds.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-bold font-headline animate-in fade-in duration-150">
                  +{toBengaliDigits(selectedIds.length)}টি সিলেক্টেড
                </span>
              )}
            </div>
          ) : isExchangeMode ? (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-300/40 text-xs font-medium font-body shadow-2xs">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {masterNumberParam ? `প্রশ্ন নং ${toBengaliDigits(masterNumberParam)} ` : ""}একই পজিশনে পরিবর্তন হবে
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs">
              <Split className="w-3.5 h-3.5 text-primary" />
              <span>১টি বিকল্প প্রশ্ন সিলেক্ট করুন</span>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Random Select Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomSelect}
              disabled={questionsLoading || (!isExchangeMode && !isAlternativeMode && maxSelectable <= 0) || (isExchangeMode ? exchangePool.length === 0 : availableUnassigned.length === 0)}
              className="group/rand h-8.5 sm:h-9 w-8.5 sm:w-auto px-0 sm:px-3 rounded-xl border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-xs font-bold text-foreground cursor-pointer flex items-center justify-center sm:justify-start gap-1.5 font-headline shrink-0 shadow-2xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border/70 disabled:hover:text-foreground"
              title={
                !isExchangeMode && !isAlternativeMode && maxSelectable <= 0
                  ? "এই সেকশনের নির্ধারিত টার্গেট ইতিমধ্যে পূর্ণ হয়েছে"
                  : selectedIds.length > 0
                  ? "পছন্দ না হলে পুনরায় র‍্যান্ডম (Re-shuffle) করুন"
                  : "তালিকা থেকে র‍্যান্ডমভাবে প্রশ্ন সিলেক্ট করুন"
              }
            >
              <Shuffle className="w-3.5 h-3.5 text-primary shrink-0 transition-transform duration-300 group-hover/rand:rotate-45 group-active/rand:rotate-180" />
              <span className="hidden sm:inline">
                {selectedIds.length > 0 && !isExchangeMode && !isAlternativeMode ? "পুনরায় র‍্যান্ডম" : "র‍্যান্ডম সিলেক্ট"}
              </span>
            </Button>

            {/* Next Sub-Section Button (if not alternative/exchange mode and next exists) */}
            {!isAlternativeMode && !isExchangeMode && nextDistStatus && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8.5 sm:h-9 w-8.5 md:w-auto px-0 md:px-3 rounded-xl border-border/70 bg-card hover:bg-muted text-xs font-bold text-foreground cursor-pointer flex items-center justify-center md:justify-start gap-1.5 font-headline shrink-0 shadow-2xs transition-all active:scale-95"
                title="পরবর্তী সেকশনে যান"
              >
                <Link href={`/question-papers/${paperId}/distributions/${nextDistStatus.distributionId}/pick`}>
                  <span className="hidden md:inline">পরবর্তী সেকশন</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Slim Target Progress Bar along bottom edge of header */}
        {!isAlternativeMode && !isExchangeMode && effectiveTargetCount > 0 && (
          <div className="md:hidden w-full h-[2.5px] bg-muted/60 relative overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                subSectionQuestionsCount >= effectiveTargetCount
                  ? "bg-emerald-500"
                  : "bg-primary"
              )}
              style={{
                width: `${Math.min(100, Math.round((subSectionQuestionsCount / effectiveTargetCount) * 100))}%`,
              }}
            />
          </div>
        )}
      </header>

      {/* Main Workspace Body: Left Sidebar + Right Content Canvas (Constrained to max-w-7xl / 1440px) */}
      <div className="flex-1 flex min-h-0 w-full max-w-7xl 2xl:max-w-[1440px] mx-auto overflow-hidden border-x border-border/40">
        {/* Left Filter Sidebar (Desktop) - Fixed & Non-collapsible */}
        <aside className="w-64 lg:w-72 border-r border-border/80 bg-card/60 backdrop-blur-xs hidden md:flex flex-col shrink-0 select-none overflow-hidden z-20">
            {/* Sidebar Header */}
            <div className="h-[58px] px-3.5 sm:px-4 border-b border-border/80 flex items-center justify-between shrink-0 bg-card/95 backdrop-blur-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span className="font-headline font-bold text-xs sm:text-sm text-foreground">ফিল্টারসমূহ</span>
                {activeFilterCount > 0 && (
                  <Badge className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {toBengaliDigits(activeFilterCount)}
                  </Badge>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 font-body cursor-pointer transition-colors"
                  title="সব ফিল্টার রিসেট করুন"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>রিসেট</span>
                </button>
              )}
            </div>

            {/* Scrollable Filter List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-body text-xs">
              {/* Quick Bookmark Toggle Tile */}
              <div
                onClick={() => {
                  setOnlyBookmarked(!onlyBookmarked);
                  setPage(1);
                }}
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]",
                  onlyBookmarked
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-400 shadow-2xs"
                    : "bg-muted/30 border-border/60 hover:bg-muted/60 text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className={cn("w-4 h-4", onlyBookmarked ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
                  <span className="font-headline font-semibold text-xs">বুকমার্ককৃত প্রশ্ন</span>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold font-headline",
                    onlyBookmarked ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {toBengaliDigits(bookmarkedIds.length)}
                </span>
              </div>

              {/* Chapter Filter Group */}
              {isChapterApplicable && chapters.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-headline">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>অধ্যায়</span>
                    </label>
                    {hasActiveChapter && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChapterId("All");
                          setPage(1);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
                      >
                        <span>ক্লিয়ার</span>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={selectedChapterId}
                    onValueChange={(val) => {
                      setSelectedChapterId(val ?? "All");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-background border border-border/70 text-xs shadow-2xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        <SelectValue placeholder="সকল অধ্যায়" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
                      <SelectItem value="All">সকল অধ্যায়</SelectItem>
                      {chapters.map((ch: any, idx: number) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          <span
                            className="font-solaiman font-semibold text-primary"
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

              {/* MCQ Type Filter Group (Desktop) */}
              {isMcqCategory && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-headline">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" />
                      <span>MCQ ধরন</span>
                    </label>
                    {hasActiveMcqType && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMcqType("All");
                          setPage(1);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
                      >
                        <span>ক্লিয়ার</span>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={selectedMcqType}
                    onValueChange={(val) => {
                      setSelectedMcqType(val ?? "All");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-background border border-border/70 text-xs shadow-2xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        <SelectValue placeholder="সকল প্রকার" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
                      <SelectItem value="All">সকল প্রকার</SelectItem>
                      {MCQ_TYPE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.labelBn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reference / Board Group */}
              {boardYears.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-headline">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span>রেফারেন্স / বোর্ড</span>
                    </label>
                    {hasActiveBoard && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBoard("All");
                          setPage(1);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
                      >
                        <span>ক্লিয়ার</span>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={selectedBoard}
                    onValueChange={(val) => {
                      setSelectedBoard(val ?? "All");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-background border border-border/70 text-xs shadow-2xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        <SelectValue placeholder="সকল রেফারেন্স" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
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

              {/* Source Group */}
              {sources.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-headline">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>উৎস</span>
                    </label>
                    {hasActiveSource && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSource("All");
                          setPage(1);
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5"
                      >
                        <span>ক্লিয়ার</span>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <Select
                    value={selectedSource}
                    onValueChange={(val) => {
                      setSelectedSource(val ?? "All");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-background border border-border/70 text-xs shadow-2xs hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        <SelectValue placeholder="সকল উৎস" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 font-body">
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

              {/* Sort Order Group */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5 font-headline">
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                  <span>সাজান</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSort("newest");
                      setPage(1);
                    }}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 font-headline",
                      selectedSort === "newest"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-background text-muted-foreground border border-border/70 hover:bg-muted/50"
                    )}
                  >
                    নতুনগুলো আগে
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSort("oldest");
                      setPage(1);
                    }}
                    className={cn(
                      "py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 font-headline",
                      selectedSort === "oldest"
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-background text-muted-foreground border border-border/70 hover:bg-muted/50"
                    )}
                  >
                    পুরাতনগুলো আগে
                  </button>
                </div>
              </div>
            </div>
          </aside>

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
          {/* Sub-Header: Search Bar, Mobile Filters Trigger, Active Badges */}
          <div
            className={cn(
              "bg-card/95 backdrop-blur-xs border-b border-border/80 shrink-0 z-30 shadow-2xs px-3 sm:px-6 flex flex-col justify-center transition-all",
              hasAnyFilter ? "py-2 sm:py-2.5 min-h-[58px]" : "h-[58px]"
            )}
          >
            <div className="w-full flex flex-col gap-2">
              {/* Primary Search & Quick Actions Row */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mobile: Prominent Chapter Filter Dropdown (Outside Drawer) */}
                <div className="md:hidden flex-1 min-w-0">
                  {isChapterApplicable && chapters.length > 0 ? (
                    <Select
                      value={selectedChapterId}
                      onValueChange={(val) => {
                        setSelectedChapterId(val ?? "All");
                        setPage(1);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full h-9.5 px-2.5 sm:px-3 rounded-xl border text-xs shadow-2xs transition-colors truncate font-headline flex items-center justify-between",
                          hasActiveChapter
                            ? "bg-primary/10 border-primary/40 text-primary font-bold"
                            : "bg-card border-border/70 text-foreground hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span className="truncate">
                            {hasActiveChapter
                              ? (chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn ||
                                 chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn ||
                                 "অধ্যায়")
                              : "সকল অধ্যায়"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-64 font-body">
                        <SelectItem value="All">সকল অধ্যায়</SelectItem>
                        {chapters.map((ch: any, idx: number) => (
                          <SelectItem key={ch.id} value={ch.id}>
                            <span
                              className="font-solaiman font-semibold text-primary"
                              style={{ fontFamily: '"SolaimanLipi", "Kalpurush", sans-serif' }}
                            >
                              {toBengaliDigits(idx + 1)}.
                            </span>{" "}
                            {ch.nameBn || ch.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-9.5 px-3 rounded-xl border border-border/70 bg-card text-xs text-muted-foreground font-headline flex items-center gap-1.5 truncate shadow-2xs">
                      <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate font-semibold text-foreground">
                        {distStatus.questionTypeNameBn || distStatus.questionTypeName || distStatus.subjectName || "সকল প্রশ্ন"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Desktop: Primary Search Input Filter (Hidden on Mobile) */}
                <div className="hidden md:block relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="প্রশ্ন, উদ্দীপক বা কী-ওয়ার্ড লিখে সার্চ করুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8.5 pr-16 h-9.5 rounded-xl border border-border/70 bg-muted/30 focus-visible:bg-background text-xs sm:text-sm text-foreground focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-body shadow-2xs"
                  />
                  {hasActiveQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setDebouncedSearch("");
                        setPage(1);
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                      title="সার্চ ক্লিয়ার করুন"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/80 bg-muted/80 border border-border/60 rounded-md absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                      Ctrl K
                    </kbd>
                  )}
                </div>

                {/* Available Questions Count Badge (Desktop) */}
                {availableData?.totalItems !== undefined && (
                  <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground font-body shrink-0 shadow-2xs">
                    <span>{hasActiveQuery ? "ফলাফল:" : "মোট প্রশ্ন:"}</span>
                    <strong className="text-foreground font-headline font-bold">
                      {toBengaliDigits(availableData.totalItems)}টি
                    </strong>
                  </div>
                )}

                {/* Mobile Bookmarked Filter Pill */}
                <button
                  type="button"
                  onClick={() => {
                    setOnlyBookmarked(!onlyBookmarked);
                    setPage(1);
                  }}
                  className={cn(
                    "md:hidden h-9.5 px-3 rounded-xl border inline-flex items-center gap-1.5 text-xs font-bold font-headline transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs",
                    onlyBookmarked
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-card border-border/70 text-foreground hover:bg-muted/50"
                  )}
                  title="বুকমার্ককৃত প্রশ্ন ফিল্টার"
                >
                  <Bookmark
                    className={cn(
                      "w-3.5 h-3.5",
                      onlyBookmarked ? "fill-white text-white" : "fill-rose-500 text-rose-500"
                    )}
                  />
                  <span className="text-[11px] font-semibold">({toBengaliDigits(bookmarkedIds.length)})</span>
                </button>

                {/* Mobile Filter Sheet Trigger Button & Content */}
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "md:hidden h-9.5 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold font-headline transition-all shrink-0 cursor-pointer active:scale-95 shadow-2xs",
                        activeFilterCount > 0
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-card border-border/70 text-foreground hover:bg-muted/50"
                      )}
                      title="সার্চ ও ফিল্টারসমূহ খুলুন"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">সার্চ ও ফিল্টার</span>
                      {activeFilterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center ml-0.5">
                          {toBengaliDigits(activeFilterCount)}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>

                  <SheetContent
                    side="bottom"
                    className="rounded-t-3xl max-h-[88vh] flex flex-col p-0 border-t border-border/60 bg-card text-foreground shadow-2xl focus:outline-hidden overflow-hidden"
                  >
                    {/* Grab Handle */}
                    <div className="w-12 h-1.5 rounded-full bg-muted-foreground/25 mx-auto mt-3 mb-1 shrink-0" />

                    {/* Sheet Header */}
                    <SheetHeader className="px-4 py-3 border-b border-border/40 text-left shrink-0">
                      <SheetTitle className="text-base font-bold font-headline flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <SlidersHorizontal className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span>সার্চ ও ফিল্টার</span>
                              {activeFilterCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                  {toBengaliDigits(activeFilterCount)}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-normal text-muted-foreground font-body leading-none mt-0.5">
                              {activeFilterCount > 0
                                ? `${toBengaliDigits(activeFilterCount)}টি ফিল্টার সক্রিয় রয়েছে`
                                : "সার্চ ও ফিল্টার সিলেক্ট করুন"}
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
                            <span>সব রিসেট</span>
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
                          {hasActiveQuery && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <Search className="w-3 h-3 text-primary shrink-0" />
                              <span>সার্চ: &quot;{search}&quot;</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearch("");
                                  setDebouncedSearch("");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {hasActiveMcqType && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <HelpCircle className="w-3 h-3 text-primary shrink-0" />
                              <span>ধরন: {MCQ_TYPE_OPTIONS.find((t) => t.value === selectedMcqType)?.labelBn || selectedMcqType}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMcqType("All");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {hasActiveChapter && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <span>
                                অধ্যায়: {chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn ||
                                  chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedChapterId("All");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {hasActiveBoard && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <span>রেফারেন্স: {selectedBoard}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBoard("All");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {hasActiveSource && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <span>উৎস: {selectedSource}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSource("All");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {hasActiveSort && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium text-[11px] border border-primary/25">
                              <span>সাজান: {selectedSort === "oldest" ? "পুরাতনগুলো আগে" : "নতুনগুলো আগে"}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSort("newest");
                                  setPage(1);
                                }}
                                className="hover:opacity-75 cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Primary Search Bar in Sheet (First Item) */}
                      <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-foreground flex items-center gap-2 font-headline">
                            <Search className="w-3.5 h-3.5 text-primary" />
                            <span>প্রশ্ন সার্চ করুন</span>
                          </label>
                          {hasActiveQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setDebouncedSearch("");
                                setPage(1);
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-0.5 font-headline"
                            >
                              <span>ক্লিয়ার</span>
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <Input
                            type="text"
                            placeholder="প্রশ্ন, উদ্দীপক বা কী-ওয়ার্ড লিখে সার্চ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8.5 pr-8 h-11 rounded-xl border border-border/60 bg-background text-xs font-body shadow-2xs focus-visible:ring-1 focus-visible:ring-primary"
                          />
                          {hasActiveQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch("");
                                setDebouncedSearch("");
                                setPage(1);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                              title="সার্চ ক্লিয়ার করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* MCQ Type Filter in Sheet (Mobile) */}
                      {isMcqCategory && (
                        <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-foreground flex items-center gap-2 font-headline">
                              <HelpCircle className="w-3.5 h-3.5 text-primary" />
                              <span>MCQ ধরন</span>
                            </label>
                            {hasActiveMcqType && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold font-headline">
                                সক্রিয়
                              </span>
                            )}
                          </div>
                          <Select
                            value={selectedMcqType}
                            onValueChange={(val) => {
                              setSelectedMcqType(val ?? "All");
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-primary font-body">
                              <div className="flex items-center gap-2 truncate pl-1">
                                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="সকল প্রকার" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-64 font-body">
                              <SelectItem value="All">সকল প্রকার</SelectItem>
                              {MCQ_TYPE_OPTIONS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.labelBn}
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
                              <Tag className="w-3.5 h-3.5 text-primary" />
                              <span>রেফারেন্স / বোর্ড</span>
                            </label>
                            {hasActiveBoard && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
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
                            <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-primary">
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
                              <FileText className="w-3.5 h-3.5 text-primary" />
                              <span>উৎস</span>
                            </label>
                            {hasActiveSource && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
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
                            <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-background border border-border/60 text-xs shadow-2xs focus:ring-1 focus:ring-primary">
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
                            <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                            <span>সাজান</span>
                          </label>
                          {hasActiveSort && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              সক্রিয়
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSort("newest");
                              setPage(1);
                            }}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                              selectedSort === "newest"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                            }`}
                          >
                            নতুনগুলো আগে
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSort("oldest");
                              setPage(1);
                            }}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer active:scale-95 ${
                              selectedSort === "oldest"
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "bg-background text-muted-foreground border border-border/60 hover:bg-muted/60"
                            }`}
                          >
                            পুরাতনগুলো আগে
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sticky Action Footer */}
                    <div className="px-3.5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center gap-2.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetAll}
                        disabled={activeFilterCount === 0}
                        className="h-11 px-4 rounded-xl font-bold flex items-center gap-1.5 border-border text-foreground shrink-0 disabled:opacity-40 cursor-pointer font-headline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>রিসেট</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setMobileFilterOpen(false)}
                        className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-transform cursor-pointer font-headline"
                      >
                        <Check className="w-4 h-4" />
                        <span>ফলাফল দেখুন</span>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filter Chips Strip */}
              {hasAnyFilter && (
                <div className="flex items-center justify-between gap-2 pt-0.5 text-xs font-display overflow-hidden">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-muted-foreground mr-0.5 font-headline shrink-0">
                      সক্রিয়:
                    </span>

                    {/* Search Query Filter Pill */}
                    {hasActiveQuery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <Search className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          সার্চ: &quot;{search}&quot;
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setDebouncedSearch("");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="সার্চ ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* Bookmarked Filter Pill */}
                    {hasActiveBookmarked && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <Bookmark className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                        <span>বুকমার্ককৃত</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOnlyBookmarked(false);
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="বুকমার্ক ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* Chapter Filter Pill */}
                    {hasActiveChapter && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <BookOpen className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[170px] sm:max-w-[200px]">
                          অধ্যায়: {chapters.find((ch: any) => ch.id === selectedChapterId)?.nameBn ||
                            chapters.find((ch: any) => ch.id === selectedChapterId)?.nameEn}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedChapterId("All");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="অধ্যায় ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* MCQ Type Filter Pill */}
                    {hasActiveMcqType && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <HelpCircle className="w-3 h-3 text-primary shrink-0" />
                        <span>ধরন: {MCQ_TYPE_OPTIONS.find((t) => t.value === selectedMcqType)?.labelBn || selectedMcqType}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMcqType("All");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="MCQ ধরন ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* Reference / Board Filter Pill */}
                    {hasActiveBoard && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <Tag className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[180px]">বোর্ড: {selectedBoard}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBoard("All");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="রেফারেন্স ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* Source Filter Pill */}
                    {hasActiveSource && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <FileText className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-[180px]">উৎস: {selectedSource}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSource("All");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="উৎস ফিল্টার বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {/* Sort Order Pill */}
                    {hasActiveSort && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border/70 text-foreground text-xs font-medium font-body shadow-2xs animate-in fade-in duration-150 shrink-0">
                        <ArrowUpDown className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="shrink-0">সাজান: {selectedSort === "oldest" ? "পুরাতনগুলো আগে" : "নতুনগুলো আগে"}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSort("newest");
                            setPage(1);
                          }}
                          className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-0.5 shrink-0"
                          title="ক্রম পরিবর্তন বাদ দিন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Reset All Filters Button */}
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer shrink-0 font-headline ml-auto active:scale-95 pl-1.5 border-l border-border/50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden xs:inline">সব রিসেট</span>
                    <span className="xs:hidden">রিসেট</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Question Canvas */}
          <main className="flex-1 overflow-auto p-3 sm:p-6">
            <div className="w-full space-y-4 sm:space-y-6 pb-28 sm:pb-32">
              {/* Alternative Mode Notification Banner */}
              {isAlternativeMode && (
                <div className="bg-primary/5 border border-primary/25 rounded-2xl p-3 sm:px-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs font-display">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Split className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground font-headline flex items-center gap-2">
                        <span>বিকল্প প্রশ্ন যোগ মোড</span>
                        <Badge className="bg-primary text-primary-foreground text-[10px] py-0 px-2 font-headline">
                          {orLabel}
                        </Badge>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground font-body mt-0.5 truncate">
                        {masterNumberParam ? `প্রশ্ন নং ${toBengaliDigits(masterNumberParam)}-এর জন্য ` : ""}
                        বিকল্প হিসেবে ১টি প্রশ্ন সিলেক্ট করুন।
                        {primaryMarksParam ? ` (মান: ${toBengaliDigits(primaryMarksParam)})` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 cursor-pointer shrink-0 rounded-xl font-bold font-headline h-8 px-3"
                  >
                    <Link href={`/question-papers/${paperId}/builder`}>
                      বাতিল ও ক্যানভাসে ফিরুন
                    </Link>
                  </Button>
                </div>
              )}

              {/* Exchange Mode Notification Banner */}
              {isExchangeMode && (
                <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl p-3 sm:px-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs font-display">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ArrowLeftRight className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-foreground font-headline flex items-center gap-2">
                        <span>প্রশ্ন পরিবর্তন মোড</span>
                        {masterNumberParam && (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/40 text-[10px] py-0 px-2 font-headline">
                            প্রশ্ন নং {toBengaliDigits(masterNumberParam)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground font-body mt-0.5 truncate">
                        {masterNumberParam ? `প্রশ্ন নং ${toBengaliDigits(masterNumberParam)}-এর স্থলে ` : ""}
                        একই পজিশনে পরিবর্তন করতে তালিকা থেকে ১টি নতুন প্রশ্ন সিলেক্ট করুন।
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer shrink-0 rounded-xl font-bold font-headline h-8 px-3"
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
                questionTypeId={(isAlternativeMode || isExchangeMode) ? "" : (urlQuestionTypeIdParam || distStatus.questionTypeId)}
                category={category}
                search={debouncedSearch}
                chapterId={selectedChapterId}
                board={selectedBoard}
                source={selectedSource}
                sort={selectedSort}
                mcqType={selectedMcqType}
                excludePaperId={paperId}
                distributionId={(isAlternativeMode || isExchangeMode) ? undefined : distributionId}
                selectedIds={selectedIds}
                selectedSubQuestionIdsMap={selectedSubQuestionIdsMap}
                onToggleSubQuestion={handleToggleSubQuestion}
                onSelectGroup={handleSelectGroup}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onlyBookmarked={onlyBookmarked}
                bookmarkedIds={bookmarkedIds}
                isExchangeMode={isExchangeMode}
                currentQuestionId={currentQuestionId}
                onResetFilters={handleResetAll}
                onClearSearch={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                  searchInputRef.current?.focus();
                }}
                onResetBookmarks={() => {
                  setOnlyBookmarked(false);
                  setPage(1);
                }}
                onToggle={(id) => {
                  setSelectedIds((prev) => {
                    if (prev.includes(id)) {
                      setSelectedSubQuestionIdsMap((m) => {
                        const next = { ...m };
                        delete next[id];
                        return next;
                      });
                      return prev.filter((item) => item !== id);
                    }
                    if (isAlternativeMode || isExchangeMode) {
                      return [id];
                    }
                    if (isSingleType) {
                      if (subSectionQuestionsCount >= 1) {
                        toast.error(
                          "এই অংশে ১টি মূল প্রশ্ন ইতিমধ্যে যুক্ত আছে। বিকল্প প্রশ্ন যোগ করতে বিল্ডারে গিয়ে 'বিকল্প (অথবা) যোগ করুন' ব্যবহার করুন।"
                        );
                        return prev;
                      }
                      return [id];
                    }
                    if (effectiveTargetCount > 0 && prev.length >= maxSelectable) {
                      if (maxSelectable === 0) {
                        toast.error("এই সেকশনের প্রশ্নের টার্গেট ইতিমধ্যে পূর্ণ হয়ে গেছে।");
                      } else {
                        toast.error(
                          `আপনি এই সেকশনে সর্বোচ্চ ${toBengaliDigits(maxSelectable)}টি প্রশ্ন সিলেক্ট করতে পারবেন।`
                        );
                      }
                      return prev;
                    }
                    return [...prev, id];
                  });
                }}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Dock */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl md:rounded-full p-2.5 md:px-5 md:py-2.5 flex flex-col md:flex-row items-center gap-2.5 md:gap-4 z-50 animate-in slide-in-from-bottom-5 select-none font-display">
          <div className="text-xs md:text-sm font-bold text-foreground flex items-center justify-between w-full md:w-auto px-1 md:px-0">
            <span className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-headline font-black text-xs">
                {toBengaliDigits(selectedIds.length)}টি
              </span>
              <span className="font-headline font-bold">
                {isSingleType && !isAlternativeMode && !isExchangeMode ? "মূল প্রশ্ন নির্বাচিত" : "প্রশ্ন নির্বাচিত"}
              </span>
            </span>
            <span className="text-muted-foreground md:ml-1 font-normal text-[11px] md:text-xs font-body">
              (প্রয়োজন: {toBengaliDigits(maxSelectable)}টি)
            </span>
          </div>
          {isExchangeMode ? (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 border-border/70 text-muted-foreground hover:bg-muted font-headline font-bold cursor-pointer text-xs px-4"
                asChild
              >
                <Link href={`/question-papers/${paperId}/builder`}>
                  বাতিল
                </Link>
              </Button>
              <Button
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold cursor-pointer gap-1.5 text-xs px-5 shrink-0 shadow-xs transition-all active:scale-95"
                disabled={isReplacing || selectedIds.length === 0}
                onClick={handleSaveExchange}
              >
                {isReplacing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                <span>পরিবর্তন নিশ্চিত করুন</span>
              </Button>
            </div>
          ) : isAlternativeMode ? (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 border-border/70 text-muted-foreground hover:bg-muted font-headline font-bold cursor-pointer text-xs px-4"
                asChild
              >
                <Link href={`/question-papers/${paperId}/builder`}>
                  বাতিল
                </Link>
              </Button>
              <Button
                className="flex-1 md:flex-none rounded-xl md:rounded-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold cursor-pointer gap-1.5 text-xs px-5 shrink-0 shadow-xs transition-all active:scale-95"
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
                className="w-full md:w-auto rounded-xl md:rounded-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold cursor-pointer gap-1.5 text-xs px-5 shrink-0 shadow-xs transition-all active:scale-95"
                disabled={isAssigning}
                onClick={() => handleSaveAndContinue(false)}
              >
                {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>সেভ করে বিল্ডারে ফিরুন</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
