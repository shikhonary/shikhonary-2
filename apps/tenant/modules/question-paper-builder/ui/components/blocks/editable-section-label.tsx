import React, { useState, useRef, useEffect } from "react";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import { useUpdateDistributionLabel } from "@/modules/question-paper/services/use-question-paper";
import { useBuilderStore } from "../../../store/use-builder-store";
import { toast } from "sonner";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

interface EditableSectionLabelProps {
  distributionId?: string;
  initialLabel?: string | null;
  fallbackLabel: string;
  questionType?: string;
  questionCount?: number | null;
  questionsToAttempt?: number | null;
  hideTrailingColon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const isMismatchedLabel = (label: string | null | undefined, questionType?: string): boolean => {
  if (!label) return false;
  const l = label.toLowerCase();
  if (
    questionType !== "POEM" &&
    questionType !== "POEM_ESSENCE" &&
    (l === "poem" || l === "poem:" || l.includes("কবিতা") || l.includes("কবিতাংশ") || l.includes("পদ্য"))
  ) {
    return true;
  }
  if (questionType === "AMPLIFICATION" && (l.includes("অনুচ্ছেদ") || l.includes("প্রবন্ধ") || l.includes("সারাংশ"))) return true;
  if (questionType === "ESSAY" && (l.includes("অনুচ্ছেদ") || l.includes("ভাব-সম্প্রসারণ") || l.includes("সারাংশ"))) return true;
  if (questionType === "PARAGRAPH" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম"))) return true;
  if (questionType === "SUMMARY" && (l.includes("সারমর্ম") || l.includes("অনুচ্ছেদ") || l.includes("ভাব-সম্প্রসারণ"))) return true;
  if (questionType === "ESSENCE" && (l.includes("সারাংশ") || l.includes("অনুচ্ছেদ") || l.includes("ভাব-সম্প্রসারণ"))) return true;
  if (questionType === "POEM_ESSENCE" && !l.includes("মূলভাব") && !l.includes("কবিতা") && !l.includes("পদ্য") && (l.includes("সারাংশ") || l.includes("অনুচ্ছেদ") || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ"))) return true;
  if (questionType === "PROSE_ESSENCE" && !l.includes("মূলভাব") && !l.includes("গদ্য") && (l.includes("সারমর্ম") || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("কবিতা"))) return true;
  if (questionType === "POEM" && (l === "poem" || l === "poem:" || l === "কবিতা" || l === "কবিতা:" || l.includes("সারাংশ") || l.includes("অনুচ্ছেদ") || l.includes("ভাব-সম্প্রসারণ"))) return true;
  if (questionType === "LETTER" && (l.includes("প্রতিবেদন") || l.includes("আবেদনপত্র") || l.includes("অনুচ্ছেদ"))) return true;
  if (questionType === "APPLICATION" && (l.includes("সংবাদ প্রতিবেদন") || l.includes("ব্যক্তিগত পত্র") || l.includes("অনুচ্ছেদ"))) return true;
  if (questionType === "NEWS_REPORT" && (l.includes("আবেদনপত্র") || l.includes("ব্যক্তিগত পত্র") || l.includes("অনুচ্ছেদ"))) return true;
  if (questionType === "PARTS_OF_SPEECH" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "PUNCTUATION" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "RIGHT_FORM_OF_VERBS" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "CHANGING_SENTENCES" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "FILL_IN_THE_BLANKS_WITH_CLUES" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "SUBSTITUTION_TABLE" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "SHORT_COMPOSITION" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "PBQ" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "DESCRIPTIVE_QUESTION" && (l === "descriptive_question" || l === "descriptive question" || l === "রচনামূলক প্রশ্ন" || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "SHORT_QUESTION" && (l === "short_question" || l === "short question" || l === "সংক্ষিপ্ত প্রশ্ন" || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "OPPOSITE_WORD" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক"))) return true;
  if (questionType === "GENDER_CHANGE" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("বিপরীত") || l.includes("সমার্থক"))) return true;
  if (questionType === "JUKTOBORNO" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক") || l.includes("বিপরীত"))) return true;
  if (questionType === "EK_KOTHAY_PROKASH" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক") || l.includes("বিপরীত") || l.includes("যুক্তবর্ণ"))) return true;
  if (questionType === "SYNONYM" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("বিপরীত"))) return true;
  if (questionType === "SADHU_TO_CHOLITO" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক") || l.includes("বিপরীত"))) return true;
  if (questionType === "POD_NIRNOY" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক") || l.includes("বিপরীত") || l.includes("সাধু") || l.includes("চলিত"))) return true;
  if (questionType === "VERB_TENSE" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি") || l.includes("সমার্থক") || l.includes("বিপরীত") || l.includes("সাধু") || l.includes("চলিত"))) return true;
  if (questionType === "NUMBER_IN_WORDS" && (l.includes("কথায়") || l.includes("কথায়") || l.includes("সংখ্যা") || l.includes("শব্দার্থ") || l.includes("অনুচ্ছেদ"))) return true;
  if (questionType === "MAKE_QUESTION" && (l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "CORRECT_ANSWER" && (l === "correct_answer" || l === "correct answer" || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "MATH_QUESTION" && (l === "math_question" || l === "math question" || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (questionType === "GRAMMAR_QUESTION" && (l === "grammar_question" || l === "grammar question" || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম") || l.includes("আবেদনপত্র") || l.includes("প্রতিবেদন") || l.includes("চিঠি"))) return true;
  if (
    (questionType === "SEEN_COMPREHENSION_1" || questionType === "SEEN_COMPREHENSION_2" || questionType === "SEEN_COMPREHENSION") &&
    (l.includes("seen comprehension") || l.includes("সীন কম্প্রিহেনশন") || l.includes("seen_comprehension") || l.includes("ভাব-সম্প্রসারণ") || l.includes("প্রবন্ধ") || l.includes("সারমর্ম"))
  ) return true;
  return false;
};

export const EditableSectionLabel = ({
  distributionId,
  initialLabel,
  fallbackLabel,
  questionType,
  questionCount,
  questionsToAttempt,
  hideTrailingColon = false,
  className = "",
  style = {},
}: EditableSectionLabelProps) => {
  const paperId = useBuilderStore((state) => state.paperId);
  const { mutateAsync: updateLabel, isPending } = useUpdateDistributionLabel();

  // Resolve active label text
  const cleanInitial = initialLabel && initialLabel.trim() !== "" ? initialLabel.trim() : null;
  const isLanguageMismatch = cleanInitial ? (
    (!/[\u0980-\u09FF]/.test(fallbackLabel) && (
      cleanInitial.includes("বিরাম চিহ্ন") || 
      cleanInitial.includes("যতিচিহ্ন") || 
      cleanInitial.includes("কথায় লেখ") || 
      cleanInitial.includes("কথায় লেখ")
    )) ||
    (/[\u0980-\u09FF]/.test(fallbackLabel) && (
      cleanInitial.toLowerCase().includes("punctuation") || 
      cleanInitial.toLowerCase().includes("capitalization")
    ))
  ) : false;

  const effectiveLabel = cleanInitial && !isMismatchedLabel(cleanInitial, questionType) && !isLanguageMismatch ? cleanInitial : fallbackLabel;

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(effectiveLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(effectiveLabel);
    }
  }, [effectiveLabel, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("লেবেল খালি রাখা যাবে না");
      return;
    }

    if (!paperId || !distributionId) {
      setIsEditing(false);
      return;
    }

    try {
      await updateLabel({
        questionPaperId: paperId,
        id: distributionId,
        questionTypeLabel: trimmed,
      });
      toast.success("বিভাগের নির্দেশিকা লেবেল আপডেট হয়েছে");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "লেবেল আপডেট করতে ব্যর্থ হয়েছে");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setValue(effectiveLabel);
      setIsEditing(false);
    }
  };

  const hasAttemptDiff =
    questionCount != null &&
    questionsToAttempt != null &&
    questionCount > 0 &&
    questionsToAttempt > 0 &&
    questionCount > questionsToAttempt;

  const isEnglishQuestion = !/[\u0980-\u09FF]/.test(value);

  const attemptSuffix = hasAttemptDiff && !value.includes("যেকোনো") && !value.toLowerCase().includes("any")
    ? isEnglishQuestion
      ? ` (any ${questionsToAttempt})`
      : ` (যেকোনো ${toBengaliDigits(questionsToAttempt)}টি)`
    : "";

  const baseLabel = value.replace(/[:।]$/, "").trim();
  const isSeenComp =
    questionType === "SEEN_COMPREHENSION_1" ||
    questionType === "SEEN_COMPREHENSION_2" ||
    questionType === "SEEN_COMPREHENSION";
  const trailingChar = hideTrailingColon || isSeenComp ? "" : value.endsWith("।") ? "।" : ":";
  const formattedDisplay = `${baseLabel}${trailingChar}${attemptSuffix}`;

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 z-20 print:hidden" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          className="px-2 py-0.5 text-xs font-bold border border-primary rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
          style={style}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
          title="সংরক্ষণ করুন"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(effectiveLabel);
            setIsEditing(false);
          }}
          disabled={isPending}
          className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
          title="বাতিল করুন"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <span
      onClick={(e) => {
        if (!distributionId) return;
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group/label relative inline-flex items-center gap-1 cursor-pointer hover:bg-primary/10 rounded px-1 -mx-1 transition-colors ${className}`}
      style={style}
      title={distributionId ? "ক্লিক করে এই লেবেল পরিবর্তন করুন" : undefined}
    >
      <span>{formattedDisplay}</span>
      {distributionId && (
        <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover/label:opacity-100 transition-opacity print:hidden shrink-0" />
      )}
    </span>
  );
};
