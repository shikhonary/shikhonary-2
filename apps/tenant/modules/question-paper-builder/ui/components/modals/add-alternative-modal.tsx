"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Split, ArrowRight, BookOpen, Layers, Loader2, Check, Search } from "lucide-react";
import { trpc } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { QUESTION_TYPE_CODES, QUESTION_TYPE_MAP, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] || digit : digit))
    .join("");
};

interface AddAlternativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paperId: string;
  distributionId?: string;
  primaryQuestionId: string;
  primaryQuestionContentId?: string;
  primaryQuestionType: QuestionTypeCode;
  subjectId: string;
  primaryMarks?: number | null;
  masterNumber?: number;
}

const CATEGORY_OPTIONS: { code: QuestionTypeCode; nameBn: string; nameEn: string; desc: string }[] = [
  { code: QUESTION_TYPE_CODES.LETTER, nameBn: "চিঠি / পত্র", nameEn: "Letter", desc: "ব্যক্তিগত বা আনুষ্ঠানিক চিঠি" },
  { code: QUESTION_TYPE_CODES.APPLICATION, nameBn: "আবেদনপত্র / দরখাস্ত", nameEn: "Application", desc: "দাপ্তরিক বা শিক্ষাপ্রতিষ্ঠানের আবেদন" },
  { code: QUESTION_TYPE_CODES.PARAGRAPH, nameBn: "অনুচ্ছেদ", nameEn: "Paragraph", desc: "বিষয়ভিত্তিক অনুচ্ছেদ লিখন" },
  { code: QUESTION_TYPE_CODES.ESSENCE, nameBn: "সারমর্ম", nameEn: "Essence", desc: "পদ্যাংশের সারমর্ম লিখন" },
  { code: QUESTION_TYPE_CODES.POEM_ESSENCE, nameBn: "কবিতার মূলভাব", nameEn: "Poem Essence", desc: "কবিতা বা পদ্যাংশের মূলভাব লিখন" },
  { code: QUESTION_TYPE_CODES.PROSE_ESSENCE, nameBn: "গদ্যের মূলভাব", nameEn: "Prose Essence", desc: "গদ্য বা অনুচ্ছেদের মূলভাব লিখন" },
  { code: QUESTION_TYPE_CODES.POEM, nameBn: "কবিতা", nameEn: "Poem", desc: "কবিতা বা পদ্যাংশ ভিত্তিক প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.SUMMARY, nameBn: "সারাংশ", nameEn: "Summary", desc: "গদ্যাংশের সারাংশ লিখন" },
  { code: QUESTION_TYPE_CODES.AMPLIFICATION, nameBn: "ভাব-সম্প্রসারণ", nameEn: "Amplification", desc: "উক্তি বা কবিতার ভাব-সম্প্রসারণ" },
  { code: QUESTION_TYPE_CODES.NEWS_REPORT, nameBn: "সংবাদ প্রতিবেদন", nameEn: "News Report", desc: "সংবাদপত্র বা অনুষ্ঠানের প্রতিবেদন লিখন" },
  { code: QUESTION_TYPE_CODES.ESSAY, nameBn: "রচনা / প্রবন্ধ", nameEn: "Essay", desc: "প্রবন্ধ বা বিষয়ভিত্তিক রচনা লিখন" },
  { code: QUESTION_TYPE_CODES.CQ, nameBn: "সৃজনশীল", nameEn: "Creative (CQ)", desc: "উদ্দীপক ও ৪টি স্তরের সৃজনশীল প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.PBQ, nameBn: "অনুচ্ছেদভিত্তিক প্রশ্ন", nameEn: "Passage Based (PBQ)", desc: "অনুচ্ছেদ ও ৫টি স্তরের প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.SEEN_COMPREHENSION_1, nameBn: "সীন কম্প্রিহেনশন ১", nameEn: "Seen Comprehension 1", desc: "পাঠ্যবইয়ের অনুচ্ছেদ ও সংশ্লিষ্ট প্রশ্ন (MCQ/সংক্ষিপ্ত)" },
  { code: QUESTION_TYPE_CODES.SEEN_COMPREHENSION_2, nameBn: "সীন কম্প্রিহেনশন ২", nameEn: "Seen Comprehension 2", desc: "পাঠ্যবইয়ের অনুচ্ছেদ ও সংশ্লিষ্ট প্রশ্ন (শূন্যস্থান/ইনফরমেশন ট্রান্সফার/ফ্লোচার্ট)" },
  { code: QUESTION_TYPE_CODES.SA, nameBn: "সংক্ষিপ্ত-উত্তর", nameEn: "Short Answer", desc: "সংক্ষিপ্ত রচনামূলক প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.PARTS_OF_SPEECH, nameBn: "পদ প্রকরণ / Parts of Speech", nameEn: "Parts of Speech", desc: "শব্দের পদ চিহ্নিতকরণ ও ব্যাকরণ" },
  { code: QUESTION_TYPE_CODES.PUNCTUATION, nameBn: "বিরাম চিহ্ন ও ক্যাপিটালাইজেশন", nameEn: "Punctuation and Capitalization", desc: "উপযুক্ত বিরাম চিহ্ন ও ক্যাপিটাল লেটার ব্যবহার" },
  { code: QUESTION_TYPE_CODES.RIGHT_FORM_OF_VERBS, nameBn: "Right Form of Verbs", nameEn: "Right Form of Verbs", desc: "বন্ধনীতে প্রদত্ত ক্রিয়ার সঠিক রূপ ব্যবহার" },
  { code: QUESTION_TYPE_CODES.CHANGING_SENTENCES, nameBn: "Changing Sentences", nameEn: "Changing Sentences", desc: "নির্দেশনা অনুযায়ী বাক্য রূপান্তর (Transformation of Sentences)" },
  { code: QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITH_CLUES, nameBn: "শূন্যস্থান পূরণ (ক্লুসহ)", nameEn: "Fill in the Blanks with Clues", desc: "বক্স থেকে উপযুক্ত শব্দ নিয়ে শূন্যস্থান পূরণ" },
  { code: QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITHOUT_CLUES, nameBn: "শূন্যস্থান পূরণ (ক্লু ছাড়া)", nameEn: "Fill in the Blanks without Clues", desc: "উপযুক্ত শব্দ বসিয়ে শূন্যস্থান পূরণ" },
  { code: QUESTION_TYPE_CODES.SUBSTITUTION_TABLE, nameBn: "সাবস্টিটিউশন টেবিল", nameEn: "Substitution Table", desc: "৩-কলামের টেবিল থেকে বাক্য গঠন" },
  { code: QUESTION_TYPE_CODES.SHORT_COMPOSITION, nameBn: "Short Composition", nameEn: "Short Composition", desc: "সংক্ষিপ্ত রচনা বা কম্পোজিশন লিখন" },
  { code: QUESTION_TYPE_CODES.DESCRIPTIVE_QUESTION, nameBn: "রচনামূলক প্রশ্ন", nameEn: "Descriptive Question", desc: "রচনামূলক বা বিস্তারিত উত্তরদানের প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.SHORT_QUESTION, nameBn: "সংক্ষিপ্ত প্রশ্ন", nameEn: "Short Question", desc: "সরাসরি সংক্ষেপে উত্তরদানের প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.MATH_QUESTION, nameBn: "গণিত প্রশ্ন", nameEn: "Math Question", desc: "গণিত সমস্যা ও সমাধান বিষয়ক প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.GRAMMAR_QUESTION, nameBn: "ব্যাকরণ প্রশ্ন", nameEn: "Grammar Question", desc: "ব্যাকরণ বিষয়ক সংক্ষিপ্ত বা সুনির্দিষ্ট প্রশ্ন" },
  { code: QUESTION_TYPE_CODES.MAKE_QUESTION, nameBn: "Make Question / প্রশ্ন তৈরি", nameEn: "Make Question", desc: "নির্দেশনা অনুযায়ী প্রশ্ন তৈরিকরণ (WH Questions)" },
  { code: QUESTION_TYPE_CODES.NUMBER_IN_WORDS, nameBn: "কথায় লেখ", nameEn: "Number in Words", desc: "সংখ্যা কথায় বা অঙ্কে প্রকাশ" },
  { code: QUESTION_TYPE_CODES.WORD_MEANING, nameBn: "শব্দার্থ", nameEn: "Word Meaning", desc: "শব্দের অর্থ লিখন" },
  { code: QUESTION_TYPE_CODES.MAKE_SENTENCES, nameBn: "বাক্য রচনা / বাক্য তৈরি", nameEn: "Make Sentences", desc: "প্রদত্ত শব্দ দিয়ে বাক্য রচনা" },
  { code: QUESTION_TYPE_CODES.OPPOSITE_WORD, nameBn: "বিপরীত শব্দ", nameEn: "Opposite Word", desc: "প্রদত্ত শব্দের বিপরীত শব্দ লিখন" },
  { code: QUESTION_TYPE_CODES.EK_KOTHAY_PROKASH, nameBn: "এক কথায় প্রকাশ", nameEn: "Ek Kothay Prokash", desc: "এক কথায় প্রকাশ বা বাক্য সংকোচন" },
  { code: QUESTION_TYPE_CODES.JUKTOBORNO, nameBn: "যুক্তবর্ণ", nameEn: "Juktoborno", desc: "যুক্তবর্ণ ভেঙে শব্দ ও বাক্য গঠন" },
  { code: QUESTION_TYPE_CODES.SYNONYM, nameBn: "সমার্থক শব্দ", nameEn: "Synonym", desc: "প্রদত্ত শব্দের সমার্থক শব্দ লিখন" },
  { code: QUESTION_TYPE_CODES.SADHU_TO_CHOLITO, nameBn: "সাধু থেকে চলিত রীতি", nameEn: "Sadhu to Cholito", desc: "প্রদত্ত সাধু শব্দের চলিত রূপ লিখন" },
  { code: QUESTION_TYPE_CODES.POD_NIRNOY, nameBn: "পদ নির্ণয়", nameEn: "Pod Nirnoy", desc: "বাক্য থেকে পদ নির্ণয় লিখন" },
  { code: QUESTION_TYPE_CODES.VERB_TENSE, nameBn: "ক্রিয়াপদের রূপ / কাল", nameEn: "Verb Tense", desc: "ক্রিয়াপদের বর্তমান, অতীত ও ভবিষ্যৎ রূপ বা কাল নির্ণয়" },
  { code: QUESTION_TYPE_CODES.FORM_FILLUP, nameBn: "ফরম পূরণ", nameEn: "Form Fillup", desc: "উদ্দীপক অনুযায়ী প্রাতিষ্ঠানিক বা ব্যক্তিগত ফরম পূরণ" },
  { code: QUESTION_TYPE_CODES.SHUDDHO_ASHUDDHO, nameBn: "শুদ্ধ অশুদ্ধ নির্ণয়", nameEn: "Shuddho Ashuddho", desc: "প্রদত্ত বাক্যের শুদ্ধ বা অশুদ্ধ রূপ নির্ণয়" },
  { code: QUESTION_TYPE_CODES.DAN_BAM_MILKORON, nameBn: "ডান-বাম মিলকরণ", nameEn: "Dan Bam Milkoron", desc: "বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলকরণ" },
];

export const AddAlternativeModal: React.FC<AddAlternativeModalProps> = ({
  open,
  onOpenChange,
  paperId,
  distributionId,
  primaryQuestionId,
  primaryQuestionContentId,
  primaryQuestionType,
  subjectId,
  primaryMarks,
  masterNumber,
}) => {
  const router = useRouter();

  // Fetch subject detail to restrict question types to this subject
  const { data: subjectDetail, isLoading: isSubjectLoading } = useQuery({
    ...trpc.academicSubject.byId.queryOptions({ id: subjectId }),
    enabled: Boolean(subjectId && open),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const availableOptions = useMemo(() => {
    if (!subjectDetail) return CATEGORY_OPTIONS;

    const codeSet = new Set<string>();

    const checkAndAdd = (item: any) => {
      const qType = item?.questionType;
      const code = qType?.code;
      const nameEn = qType?.nameEn || "";
      const nameBn = qType?.nameBn || "";

      if (code && typeof code === "string") {
        codeSet.add(code.toUpperCase());
      }
      const norm = normalizeQuestionTypeName(nameEn) || normalizeQuestionTypeName(nameBn);
      if (norm) {
        const mappedCode = QUESTION_TYPE_MAP[norm]?.code;
        if (mappedCode) {
          codeSet.add(mappedCode.toUpperCase());
        }
      }
    };

    if (Array.isArray(subjectDetail.subjectQuestionTypes)) {
      subjectDetail.subjectQuestionTypes.forEach(checkAndAdd);
    }

    if (Array.isArray(subjectDetail.sections)) {
      subjectDetail.sections.forEach((sec: any) => {
        if (Array.isArray(sec.subjectQuestionTypes)) {
          sec.subjectQuestionTypes.forEach(checkAndAdd);
        }
        if (Array.isArray(sec.subSections)) {
          sec.subSections.forEach((sub: any) => {
            if (Array.isArray(sub.subjectQuestionTypes)) {
              sub.subjectQuestionTypes.forEach(checkAndAdd);
            }
          });
        }
      });
    }

    if (codeSet.size === 0) return CATEGORY_OPTIONS;

    const filtered = CATEGORY_OPTIONS.filter((opt) => codeSet.has(opt.code.toUpperCase()));
    return filtered.length > 0 ? filtered : CATEGORY_OPTIONS;
  }, [subjectDetail]);

  const [selectedCategory, setSelectedCategory] = useState<QuestionTypeCode>(primaryQuestionType);
  const [orLabel, setOrLabel] = useState("অথবা");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return availableOptions;
    const query = searchQuery.toLowerCase().trim();
    return availableOptions.filter(
      (opt) =>
        opt.nameBn.toLowerCase().includes(query) ||
        opt.nameEn.toLowerCase().includes(query) ||
        opt.desc.toLowerCase().includes(query)
    );
  }, [availableOptions, searchQuery]);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      if (availableOptions.some((opt) => opt.code === primaryQuestionType)) {
        setSelectedCategory(primaryQuestionType);
      } else if (availableOptions.length > 0) {
        setSelectedCategory(availableOptions[0]!.code);
      }
      setOrLabel("অথবা");
    }
  }, [open, primaryQuestionType, availableOptions]);

  const handleProceedToPicker = () => {
    const distId = distributionId || "default";
    const params = new URLSearchParams();
    params.set("mode", "alternative");
    params.set("parentQuestionId", primaryQuestionId);
    params.set("category", selectedCategory);
    params.set("orLabel", orLabel.trim() || "অথবা");
    if (primaryMarks !== undefined && primaryMarks !== null) {
      params.set("primaryMarks", String(primaryMarks));
    }
    if (masterNumber) {
      params.set("masterNumber", String(masterNumber));
    }
    if (primaryQuestionContentId) {
      params.set("primaryContentId", primaryQuestionContentId);
    }

    onOpenChange(false);
    router.push(`/question-papers/${paperId}/distributions/${distId}/pick?${params.toString()}`);
  };

  const primaryCategoryName =
    CATEGORY_OPTIONS.find((c) => c.code === primaryQuestionType)?.nameBn || primaryQuestionType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-display sm:max-w-lg p-0 overflow-hidden bg-card border-border shadow-xl">
        {/* Themed Header with Tinted Indigo Accent */}
        <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/60 bg-indigo-500/5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-2xs">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-headline text-foreground leading-snug">
                বিকল্প (অথবা) প্রশ্নের ধরন নির্বাচন
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-body mt-0.5">
                {masterNumber ? `${toBengaliDigits(masterNumber)} নং প্রশ্নের জন্য ` : ""}
                বিকল্প হিসেবে কোন ধরনের প্রশ্ন নির্বাচন করতে চান তা নির্ধারণ করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 font-body text-xs sm:text-sm max-h-[75vh] overflow-y-auto">
          {/* Primary Question Info Banner */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-muted-foreground font-medium block">মূল প্রশ্ন:</span>
                <span className="font-bold text-foreground font-headline truncate block mt-0.5">
                  {masterNumber ? `${toBengaliDigits(masterNumber)}। ` : ""}
                  {primaryCategoryName}
                </span>
              </div>
            </div>
            {primaryMarks !== undefined && primaryMarks !== null && (
              <Badge
                variant="outline"
                className="font-bold text-xs border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 shrink-0 font-headline"
              >
                মান: {toBengaliDigits(primaryMarks)}
              </Badge>
            )}
          </div>

          {/* Question Type Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-headline text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>বিকল্প প্রশ্নের ধরন (Question Type):</span>
              </label>
              {isSubjectLoading && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>লোড হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্নের ধরন খুঁজুন (যেমন: চিঠি, দরখাস্ত, অনুচ্ছেদ)..."
                className="h-8.5 pl-8 text-xs rounded-xl bg-background border-border/80 font-body placeholder:text-muted-foreground/70"
              />
            </div>

            {/* Types List Grid */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredOptions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs font-body">
                  কোনো প্রশ্নের ধরন পাওয়া যায়নি।
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedCategory === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setSelectedCategory(opt.code)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs active:scale-99 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-foreground ring-2 ring-indigo-500/30 shadow-xs"
                          : "border-border/80 bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold font-headline text-foreground truncate">
                            {opt.nameBn}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({opt.nameEn})
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-body">
                          {opt.desc}
                        </p>
                      </div>

                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border/80 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Connector Label */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 shadow-2xs">
            <label className="text-xs font-bold font-headline text-foreground block">
              সংযোগকারী লেবেল (Connector Label):
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <Input
                value={orLabel}
                onChange={(e) => setOrLabel(e.target.value)}
                placeholder="অথবা"
                className="h-8.5 text-xs font-bold font-headline w-full sm:w-28 text-center bg-background rounded-xl border-border/80"
              />
              <div className="flex gap-1.5 flex-wrap">
                {["অথবা", "বা", "OR"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setOrLabel(l)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all cursor-pointer border ${
                      orLabel === l
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-background border-border/80 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-9 px-4 text-xs font-bold font-headline rounded-xl cursor-pointer"
          >
            বাতিল
          </Button>

          <Button
            type="button"
            onClick={handleProceedToPicker}
            className="w-full sm:w-auto h-9 px-4.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-headline text-xs cursor-pointer gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <span>গ্রিড ভিউতে প্রশ্ন নির্বাচন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
