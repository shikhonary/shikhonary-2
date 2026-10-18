import React, { useState, useRef, useEffect, useMemo } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { useBuilderStore } from "../../../store/use-builder-store";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Bold, 
  Trash2, 
  Loader2, 
  Split, 
  ListFilter, 
  X, 
  CheckSquare, 
  Square, 
  Eye, 
  EyeOff,
  Layers
} from "lucide-react";
import { 
  useRemoveQuestion, 
  useQuestionPaperDistributionStatuses,
  useUpdateQuestionPaperQuestion 
} from "@/modules/question-paper/services/use-question-paper";
import { AlternativeQuestionRenderer } from "./alternative-question-renderer";
import { AddAlternativeModal } from "../modals/add-alternative-modal";
import { EditableSectionLabel } from "./editable-section-label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "sonner";

const toBengaliDigits = (num?: number | string | null): string => {
  if (num === null || num === undefined || num === "") return "";
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit, 10)] : digit))
    .join("");
};

const parseObjectMarks = (obj: Record<string, any>): number[] => {
  const alphaKeys = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const bnAlphaKeys = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ"];
  const numKeys = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const zeroKeys = ["0", "1", "2", "3", "4", "5", "6", "7"];
  const bnNumKeys = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮"];
  
  if (alphaKeys.some((k) => obj[k] !== undefined)) {
    const res: number[] = [];
    for (const k of alphaKeys) {
      if (obj[k] !== undefined && !isNaN(Number(obj[k]))) {
        res.push(Number(obj[k]));
      }
    }
    if (res.length > 0) return res;
  }

  if (bnAlphaKeys.some((k) => obj[k] !== undefined)) {
    const res: number[] = [];
    for (const k of bnAlphaKeys) {
      if (obj[k] !== undefined && !isNaN(Number(obj[k]))) {
        res.push(Number(obj[k]));
      }
    }
    if (res.length > 0) return res;
  }

  if (obj["0"] !== undefined || obj[0] !== undefined) {
    const res: number[] = [];
    for (const k of zeroKeys) {
      if (obj[k] !== undefined && !isNaN(Number(obj[k]))) {
        res.push(Number(obj[k]));
      }
    }
    if (res.length > 0) return res;
  }
  
  if (numKeys.some((k) => obj[k] !== undefined)) {
    const res: number[] = [];
    for (const k of numKeys) {
      if (obj[k] !== undefined && !isNaN(Number(obj[k]))) {
        res.push(Number(obj[k]));
      }
    }
    if (res.length > 0) return res;
  }

  if (bnNumKeys.some((k) => obj[k] !== undefined)) {
    const res: number[] = [];
    for (const k of bnNumKeys) {
      if (obj[k] !== undefined && !isNaN(Number(obj[k]))) {
        res.push(Number(obj[k]));
      }
    }
    if (res.length > 0) return res;
  }
  
  return Object.values(obj).map((v) => Number(v)).filter((n) => !isNaN(n));
};

const parseGroupMarks = (raw: any): number[] => {
  if (raw === null || raw === undefined) return [];
  if (typeof raw === "number") return isNaN(raw) ? [] : [raw];
  if (Array.isArray(raw)) {
    return raw.map((v) => Number(v)).filter((n) => !isNaN(n));
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "number") {
        return isNaN(parsed) ? [] : [parsed];
      }
      if (Array.isArray(parsed)) {
        return parsed.map((v) => Number(v)).filter((n) => !isNaN(n));
      }
      if (typeof parsed === "object" && parsed !== null) {
        return parseObjectMarks(parsed);
      }
    } catch {
      const parts = trimmed.split(/[,+\/\s]+/).map((p) => parseFloat(p)).filter((n) => !isNaN(n));
      if (parts.length > 0) return parts;
    }
  }
  if (typeof raw === "object" && raw !== null) {
    return parseObjectMarks(raw);
  }
  return [];
};

/**
 * Auto-balances group marks for Seen Comprehension blocks using Approach 2.
 * Ensures the sum of all selected group totals equals targetTotal (e.g. 20)
 * while finding clean, authentic exam-grade per-item marks (integers or .5 halves).
 */
function autoBalanceGroupMarks(
  groups: Array<{ gNum: number; count: number; baseWeight: number; isMcq: boolean; isTrueFalse: boolean }>,
  targetTotal: number
): Record<number, { totalGroupMarks: number; marksPerItem: number }> {
  if (groups.length === 0 || targetTotal <= 0) return {};

  const totalBaseWeight = groups.reduce((sum, g) => sum + g.baseWeight, 0);

  // If the base weights of the selected groups ALREADY sum to targetTotal, use them directly
  if (Math.abs(totalBaseWeight - targetTotal) < 0.001) {
    const result: Record<number, { totalGroupMarks: number; marksPerItem: number }> = {};
    for (const g of groups) {
      const marksPerItem = g.count > 0 ? Math.round((g.baseWeight / g.count) * 100) / 100 : g.baseWeight;
      result[g.gNum] = { totalGroupMarks: g.baseWeight, marksPerItem };
    }
    return result;
  }

  // Standard exam mark steps per item
  const validSteps = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

  // Try to find the combination of validSteps that sums to targetTotal with minimal deviation
  const numGroups = groups.length;
  let bestSolution: number[] | null = null;
  let lowestCost = Infinity;

  const targetProportions = groups.map((g) => 
    totalBaseWeight > 0 ? (g.baseWeight / totalBaseWeight) * targetTotal : targetTotal / numGroups
  );

  function search(idx: number, currentSteps: number[], currentSum: number) {
    if (idx === numGroups) {
      if (Math.abs(currentSum - targetTotal) < 0.001) {
        let cost = 0;
        for (let i = 0; i < numGroups; i++) {
          const g = groups[i];
          const step = currentSteps[i];
          if (!g || step === undefined) continue;
          const groupMarks = step * g.count;
          const targetMarks = targetProportions[i] ?? 0;
          // Square error against ideal proportional weight
          cost += Math.pow(groupMarks - targetMarks, 2);
          // Prefer integer steps over half steps
          if (!Number.isInteger(step)) {
            cost += 3.0;
          }
        }
        if (cost < lowestCost) {
          lowestCost = cost;
          bestSolution = [...currentSteps];
        }
      }
      return;
    }

    const currentGroup = groups[idx];
    if (!currentGroup) return;

    const remainingGroups = numGroups - idx - 1;
    for (const step of validSteps) {
      const stepTotal = step * currentGroup.count;
      const nextSum = currentSum + stepTotal;
      // Prune if we exceed targetTotal and cannot reach it with minimal remaining steps
      if (nextSum + remainingGroups * 0.5 > targetTotal + 0.001) continue;
      search(idx + 1, [...currentSteps, step], nextSum);
    }
  }

  search(0, [], 0);

  const result: Record<number, { totalGroupMarks: number; marksPerItem: number }> = {};

  if (bestSolution) {
    for (let i = 0; i < numGroups; i++) {
      const step = (bestSolution as number[])[i];
      const g = groups[i];
      if (!g || step === undefined) continue;
      const totalGroupMarks = Math.round(step * g.count * 100) / 100;
      result[g.gNum] = { totalGroupMarks, marksPerItem: step };
    }
    return result;
  }

  // Fallback: Proportional scaling if no exact clean step was found
  let accumulated = 0;
  for (let i = 0; i < numGroups; i++) {
    const g = groups[i];
    if (!g) continue;
    let allocatedTotal: number;
    if (i === numGroups - 1) {
      allocatedTotal = Math.round((targetTotal - accumulated) * 100) / 100;
    } else {
      const ratio = totalBaseWeight > 0 ? g.baseWeight / totalBaseWeight : 1 / numGroups;
      allocatedTotal = Math.round(ratio * targetTotal * 2) / 2; // round to nearest 0.5
      accumulated += allocatedTotal;
    }
    const marksPerItem = g.count > 0 ? Math.round((allocatedTotal / g.count) * 100) / 100 : allocatedTotal;
    result[g.gNum] = { totalGroupMarks: allocatedTotal, marksPerItem };
  }

  return result;
}

const ComprehensionEditableText = ({ 
  text, 
  itemKey, 
  defaultStyle,
  className = ""
}: { 
  text: string, 
  itemKey: string, 
  defaultStyle: any,
  className?: string
}) => {
  const [isActive, setIsActive] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const setItemStyle = useBuilderStore(state => state.setItemStyle);
  const itemStyles = useBuilderStore(state => state.settings.itemStyles);
  
  const customStyle = itemStyles?.[itemKey] || {};
  const mergedStyle = { ...defaultStyle, ...customStyle };
  
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      if (textRef.current?.contains(e.target as Node)) return;
      setIsActive(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isActive]);
  
  const toggleBold = () => {
    const isBold = mergedStyle.fontWeight === "bold" || mergedStyle.fontWeight === 700 || mergedStyle.fontWeight === 600;
    setItemStyle(itemKey, { fontWeight: isBold ? "normal" : "bold" });
  };
  
  const changeSize = (delta: number) => {
    const currentSize = mergedStyle.fontSize || 12;
    setItemStyle(itemKey, { fontSize: currentSize + delta });
  };
  
  const setAlign = (align: "left" | "center" | "right" | "justify") => {
    setItemStyle(itemKey, { textAlign: align });
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        ref={textRef}
        onClick={() => setIsActive(true)}
        className="cursor-pointer transition-all duration-150 rounded text-justify w-full"
        style={{
          ...mergedStyle,
          textAlign: mergedStyle.textAlign || "justify",
          textJustify: "inter-word",
          textAlignLast: "left",
        }}
      >
        <RenderMath text={text} as="div" className="text-justify w-full" />
      </div>

      {isActive && (
        <div 
          ref={toolbarRef}
          className="absolute -top-11 left-0 z-50 flex items-center gap-1 bg-white border border-gray-200 shadow-md rounded-md p-1 text-xs select-none print:hidden"
        >
          <button 
            type="button"
            onClick={toggleBold} 
            className={`p-1 rounded hover:bg-gray-100 ${mergedStyle.fontWeight === "bold" ? "bg-gray-200" : ""}`}
            title="Toggle Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />
          <button 
            type="button"
            onClick={() => changeSize(1)} 
            className="px-1.5 py-0.5 rounded hover:bg-gray-100 font-bold"
            title="Increase Size"
          >
            A+
          </button>
          <button 
            type="button"
            onClick={() => changeSize(-1)} 
            className="px-1.5 py-0.5 rounded hover:bg-gray-100 font-bold"
            title="Decrease Size"
          >
            A-
          </button>
          <div className="h-4 w-[1px] bg-gray-200 mx-0.5" />
          <button 
            type="button"
            onClick={() => setAlign("left")} 
            className={`p-1 rounded hover:bg-gray-100 ${mergedStyle.textAlign === "left" ? "bg-gray-200" : ""}`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setAlign("center")} 
            className={`p-1 rounded hover:bg-gray-100 ${mergedStyle.textAlign === "center" ? "bg-gray-200" : ""}`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setAlign("right")} 
            className={`p-1 rounded hover:bg-gray-100 ${mergedStyle.textAlign === "right" ? "bg-gray-200" : ""}`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setAlign("justify")} 
            className={`p-1 rounded hover:bg-gray-100 ${mergedStyle.textAlign === "justify" ? "bg-gray-200" : ""}`}
            title="Align Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export const SeenComprehensionBlock = ({ item }: { item: any }) => {
  const data = item.data || item.seenComprehension || item;
  const settings = useBuilderStore((state) => state.settings);
  const setMcqOptionLayout = useBuilderStore((state) => state.setMcqOptionLayout);
  const paperId = useBuilderStore((state) => state.paperId);
  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();
  const { mutateAsync: updateQuestion, isPending: isUpdatingQuestion } = useUpdateQuestionPaperQuestion();

  const { data: statuses } = useQuestionPaperDistributionStatuses(paperId || "");
  const distStatus = statuses?.find((s: any) => s.distributionId === (item.distributionId || data.distributionId || item.distribution?.id));
  const totalMarks = Number(
    item.distribution?.totalMarks ??
    distStatus?.totalMarks ??
    data.totalMarks ??
    item.totalMarks ??
    item.assignedMarks ??
    15
  );

  const [showAddAlternative, setShowAddAlternative] = useState(false);
  const [showRepeatedPassage, setShowRepeatedPassage] = useState(false);
  const [subQuestionsModalOpen, setSubQuestionsModalOpen] = useState(false);

  // All sub-questions of this passage (including unselected)
  const allAvailableQuestions: any[] = useMemo(() => {
    return data.allQuestions || data.questions || [];
  }, [data.allQuestions, data.questions]);

  // Currently active displayed questions for this paper slot
  const questions: any[] = useMemo(() => {
    return Array.isArray(data.questions) ? data.questions : [];
  }, [data.questions]);

  // Draft selection state for the sub-questions config dialog
  const [tempSelectedSubIds, setTempSelectedSubIds] = useState<string[]>([]);

  useEffect(() => {
    if (subQuestionsModalOpen) {
      setTempSelectedSubIds(questions.map((q) => q.id));
    }
  }, [subQuestionsModalOpen, questions]);

  const handleRemove = () => {
    if (!paperId) return;
    removeQuestion({
      questionPaperId: paperId,
      questionId: data.id || item.id,
      questionType: data.comprehensionType || "SEEN_COMPREHENSION_1",
    });
  };

  const handleRemoveSingleSub = async (subId: string) => {
    if (!paperId) return;
    const remainingSubIds = questions.filter((sq) => sq.id !== subId).map((sq) => sq.id);
    if (remainingSubIds.length === 0) {
      handleRemove();
      return;
    }
    try {
      await updateQuestion({
        id: item.id,
        questionPaperId: paperId,
        selectedSubQuestionIds: remainingSubIds,
      });
      toast.success("উপ-প্রশ্নটি বাদ দেওয়া হয়েছে");
    } catch {
      toast.error("উপ-প্রশ্ন পরিবর্তন করা সম্ভব হয়নি");
    }
  };

  const handleSaveSubQuestionsConfig = async () => {
    if (!paperId) return;
    if (tempSelectedSubIds.length === 0) {
      toast.error("কমপক্ষে একটি উপ-প্রশ্ন নির্বাচন করতে হবে");
      return;
    }
    try {
      await updateQuestion({
        id: item.id,
        questionPaperId: paperId,
        selectedSubQuestionIds: tempSelectedSubIds,
      });
      setSubQuestionsModalOpen(false);
      toast.success("উপ-প্রশ্নসমূহ সফলভাবে হালনাগাদ করা হয়েছে");
    } catch {
      toast.error("উপ-প্রশ্ন হালনাগাদ করা ব্যর্থ হয়েছে");
    }
  };

  const questionStyle = {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    textAlign: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: settings.fontWeight || "normal",
  };

  const contextStyle = {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    textAlign: "justify" as const,
    textJustify: "inter-word" as const,
    textAlignLast: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: "normal" as const,
  };

  const renderOptionLabel = (label: string) => {
    const clean = String(label).replace(/^\(+|\)+$/g, "").replace(/\.$/, "").trim();
    switch (settings.optionStyle) {
      case "parentheses":
        return (
          <span 
            className="shrink-0 font-normal min-w-[1.35em] inline-block" 
            style={{ fontWeight: "normal" }}
          >
            ({clean})
          </span>
        );
      case "round":
        return (
          <span 
            className="shrink-0 font-normal min-w-[1.15em] inline-block" 
            style={{ fontWeight: "normal" }}
          >
            {clean})
          </span>
        );
      case "dot":
      case "circle":
      default:
        // Use dot-type option indicator (e.g. i.) instead of round border indicator
        return (
          <span 
            className="shrink-0 font-normal min-w-[1.15em] inline-block" 
            style={{ fontWeight: "normal" }}
          >
            {clean}.
          </span>
        );
    }
  };

  // Group all available questions for the config modal & mapping
  const allGroupedQuestions = useMemo(() => {
    return allAvailableQuestions.reduce((acc: Record<number, any[]>, q: any) => {
      const gNum = q.groupNumber || 1;
      if (!acc[gNum]) acc[gNum] = [];
      acc[gNum].push(q);
      return acc;
    }, {});
  }, [allAvailableQuestions]);

  const allGroupKeys = Object.keys(allGroupedQuestions).map(Number).sort((a, b) => a - b);

  // Group sub-questions currently active in this paper block
  const groupedQuestions = useMemo(() => {
    return questions.reduce((acc: Record<number, any[]>, q: any) => {
      const gNum = q.groupNumber || 1;
      if (!acc[gNum]) acc[gNum] = [];
      acc[gNum].push(q);
      return acc;
    }, {});
  }, [questions]);

  const groupKeys = Object.keys(groupedQuestions).map(Number).sort((a, b) => a - b);

  // Map of group number -> global question number
  const groupToQuestionNumMap = useMemo(() => {
    const baseNumber = item.startQuestionNumber || item.masterNumber || 1;
    const map = new Map<number, number>();
    allGroupKeys.forEach((gNum, idx) => {
      const groupQuestions = allAvailableQuestions.filter((q: any) => (q.groupNumber || 1) === gNum);
      const title = groupQuestions[0]?.groupTitle?.trim() || "";
      const match = title.match(/^(\d+)[\.\)\s]/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (parsed >= baseNumber) {
          map.set(gNum, parsed);
          return;
        }
      }
      map.set(gNum, baseNumber + idx);
    });
    return map;
  }, [allGroupKeys, allAvailableQuestions, item.startQuestionNumber, item.masterNumber]);

  const masterNum = item.startQuestionNumber || item.masterNumber || (item.orderIndex + 1);

  // Question numbers of the question types currently remaining in this block
  const remainingQuestionTypeNumbers = useMemo(() => {
    return groupKeys.map((gNum) => groupToQuestionNumMap.get(gNum) ?? gNum);
  }, [groupKeys, groupToQuestionNumMap]);

  // Dynamic instruction label: "Read the passage carefully and answer the question(s) [numbers]" (no colon)
  const dynamicInstructionLabel = useMemo(() => {
    if (remainingQuestionTypeNumbers.length === 0) {
      return "Read the passage carefully and answer the questions following it";
    }
    if (remainingQuestionTypeNumbers.length === 1) {
      return `Read the passage carefully and answer the question ${remainingQuestionTypeNumbers[0]}`;
    }
    if (remainingQuestionTypeNumbers.length === 2) {
      return `Read the passage carefully and answer the questions ${remainingQuestionTypeNumbers[0]} and ${remainingQuestionTypeNumbers[1]}`;
    }
    const allButLast = remainingQuestionTypeNumbers.slice(0, -1).join(", ");
    const last = remainingQuestionTypeNumbers[remainingQuestionTypeNumbers.length - 1];
    return `Read the passage carefully and answer the questions ${allButLast} and ${last}`;
  }, [remainingQuestionTypeNumbers]);

  const distLabel = distStatus?.questionTypeLabel || item.distribution?.questionTypeLabel || item.questionTypeLabel;
  const isGeneric = !distLabel || 
    distLabel.trim() === "" ||
    distLabel.toLowerCase().includes("seen comprehension") ||
    distLabel.includes("সীন কম্প্রিহেনশন") ||
    distLabel.toLowerCase().includes("seen_comprehension") ||
    distLabel.trim().replace(/[:\s]+$/, "") === "Read the passage carefully and answer the questions following it" ||
    distLabel.trim().replace(/[:\s]+$/, "") === "Read the passage carefully and answer the following questions";
  const cleanCustomLabel = isGeneric ? null : distLabel.trim().replace(/[:\s]+$/, "");

  // Extract candidate mark distribution list (e.g. [5, 5, 10])
  const distGroupMarksList: number[] = useMemo(() => {
    const candidateDistList = [
      distStatus?.markDistribution,
      item.markDistribution,
      item.distribution?.markDistribution,
      data.markDistribution,
      data.distribution?.markDistribution,
    ];
    for (const cand of candidateDistList) {
      if (cand !== undefined && cand !== null && cand !== "") {
        const parsed = parseGroupMarks(cand);
        if (parsed.length > 0) return parsed;
      }
    }
    return [];
  }, [
    distStatus?.markDistribution,
    item.markDistribution,
    item.distribution?.markDistribution,
    data.markDistribution,
    data.distribution?.markDistribution,
  ]);

  // Target total marks for this comprehension block (e.g. 20)
  const targetBlockTotal = useMemo(() => {
    const distTemplateSum = distGroupMarksList.reduce((sum, m) => sum + m, 0);
    if (distTemplateSum > 0) return distTemplateSum;
    const cand =
      item.marksPerQuestion ??
      distStatus?.marksPerQuestion ??
      item.distribution?.marksPerQuestion ??
      data.marksPerQuestion ??
      item.distribution?.totalMarks ??
      distStatus?.totalMarks ??
      item.totalMarks ??
      data.totalMarks ??
      totalMarks;
    const num = Number(cand);
    return !isNaN(num) && num > 0 ? num : 20;
  }, [distGroupMarksList, item, distStatus, data, totalMarks]);

  // Active groups metadata for auto-balancing
  const activeGroupsMetadata = useMemo(() => {
    return groupKeys.map((gNum, gIdx) => {
      const groupItems = groupedQuestions[gNum] || [];
      const groupTitle = groupItems[0]?.groupTitle;

      const isTrueFalse = 
        groupItems[0]?.type === "TRUE_FALSE" ||
        groupItems.some((sq: any) => sq.type === "TRUE_FALSE") ||
        (groupTitle?.toLowerCase().includes("true") ?? false) ||
        (groupTitle?.toLowerCase().includes("false") ?? false) ||
        (groupTitle?.includes("সত্য") ?? false) ||
        (groupTitle?.includes("মিথ্যা") ?? false);

      const isMcq = 
        !isTrueFalse && (
          groupItems[0]?.type === "MCQ" ||
          (groupTitle?.toLowerCase().includes("choose") ?? false) ||
          (groupTitle?.toLowerCase().includes("mcq") ?? false) ||
          (groupTitle?.includes("সঠিক উত্তর") ?? false) ||
          groupItems.some((sq: any) => {
            const rawOptions = typeof sq.options === "string" ? JSON.parse(sq.options || "[]") : sq.options || [];
            return Array.isArray(rawOptions) && rawOptions.length > 0;
          })
        );

      const originalGroupIndex = allGroupKeys.indexOf(gNum);
      const groupMarkIndex = originalGroupIndex !== -1 ? originalGroupIndex : gIdx;

      let baseWeight: number;
      const indexedMark = distGroupMarksList[groupMarkIndex];
      const fallbackMark = distGroupMarksList[gIdx];
      if (indexedMark !== undefined) {
        baseWeight = indexedMark;
      } else if (fallbackMark !== undefined) {
        baseWeight = fallbackMark;
      } else {
        const defaultSingleMark = Number(groupItems[0]?.marks ?? (isMcq || isTrueFalse ? 1 : 2));
        baseWeight = groupItems.reduce(
          (sum: number, sq: any) =>
            sum +
            (sq.marks !== undefined && sq.marks !== null && !isNaN(Number(sq.marks))
              ? Number(sq.marks)
              : defaultSingleMark),
          0
        );
      }

      return {
        gNum,
        count: groupItems.length,
        baseWeight,
        isMcq,
        isTrueFalse,
      };
    });
  }, [groupKeys, groupedQuestions, allGroupKeys, distGroupMarksList]);

  // Smart auto-balanced marks for selected groups using Approach 2
  const balancedMarksMap = useMemo(() => {
    return autoBalanceGroupMarks(activeGroupsMetadata, targetBlockTotal);
  }, [activeGroupsMetadata, targetBlockTotal]);

  const isFirst = item.isFirstComprehension !== undefined ? item.isFirstComprehension : (item.orderIndex === 0);
  const shouldShowHeader = !item.isPassageRepeated || isFirst;

  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors flex flex-col break-inside-avoid ${isFirst ? "pt-0.5 pb-0" : "py-0 my-0"}`}>
      {/* Hover Controls */}
      <div className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
        {allAvailableQuestions.length > 1 && (
          <button
            type="button"
            onClick={() => setSubQuestionsModalOpen(true)}
            className="px-2 py-1 text-xs hover:bg-primary/10 transition-colors text-primary flex items-center gap-1 border-r cursor-pointer"
            title="উপ-প্রশ্ন নির্বাচন বা পরিবর্তন করুন"
          >
            <ListFilter className="w-3 h-3" />
            উপ-প্রশ্ন ({toBengaliDigits(questions.length)}/{toBengaliDigits(allAvailableQuestions.length)})
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowAddAlternative(true)}
          className="px-2 py-1 text-xs hover:bg-primary/10 transition-colors text-primary flex items-center gap-1 border-r cursor-pointer"
          title="বিকল্প (অথবা) প্রশ্ন যুক্ত করুন"
        >
          <Split className="w-3 h-3" />
          অথবা
        </button>
        <button 
          onClick={handleRemove}
          disabled={isRemoving}
          className={`px-2 py-1 text-xs hover:bg-destructive/10 transition-colors text-destructive flex items-center gap-1 cursor-pointer ${isRemoving ? "opacity-50" : ""}`}
          title="Remove Question"
        >
          {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove
        </button>
      </div>

      {/* Main Header / Instruction */}
      {shouldShowHeader && (
        <div className="flex justify-between items-start w-full mb-0">
          <div 
            className="font-bold flex items-baseline gap-2 flex-1" 
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
          >
            <span
              className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
              style={{
                fontSize: questionStyle.fontSize,
                fontFamily: questionStyle.fontFamily,
              }}
              aria-hidden="true"
            >
              {masterNum}.
            </span>
            <div className="flex-1">
              <EditableSectionLabel
                distributionId={item.distributionId || data.distributionId || item.distribution?.id}
                initialLabel={cleanCustomLabel}
                fallbackLabel={dynamicInstructionLabel}
                questionType={data.comprehensionType || "SEEN_COMPREHENSION_1"}
                hideTrailingColon={true}
                style={{
                  fontSize: questionStyle.fontSize,
                  fontFamily: questionStyle.fontFamily,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reading Passage Or Deduplication Referral */}
      {item.isPassageRepeated && !showRepeatedPassage ? (
        <div className="my-1 flex items-start gap-2 w-full">
          <span
            className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
            aria-hidden="true"
          >
            {masterNum}.
          </span>
          <div className="flex-1 p-2 bg-muted/15 border border-dashed border-outline-variant/60 rounded-md text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-primary">নোট:</span>
              <span className="text-muted-foreground font-body">
                {item.firstOccurrenceNumber 
                  ? `${toBengaliDigits(item.firstOccurrenceNumber)} নং প্রশ্নের প্যাসেজের আলোকে নিচের প্রশ্নগুলোর উত্তর দাও:` 
                  : "উপরের প্যাসেজের আলোকে নিচের প্রশ্নগুলোর উত্তর দাও:"}
                {data.title && <span className="font-semibold text-foreground ml-1">("{data.title}")</span>}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRepeatedPassage(true)}
              className="text-[11px] text-primary hover:underline font-semibold shrink-0 cursor-pointer print:hidden flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              প্যাসেজ দেখুন
            </button>
          </div>
        </div>
      ) : data.passage ? (
        <div className="mt-0.5 mb-1 relative group/passage">
          {item.isPassageRepeated && (
            <div className="flex justify-end print:hidden mb-1">
              <button
                type="button"
                onClick={() => setShowRepeatedPassage(false)}
                className="text-[11px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
                প্যাসেজ সংক্ষেপ করুন
              </button>
            </div>
          )}
          <div className="flex items-start gap-2 w-full">
            <span
              className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
              style={{
                fontSize: questionStyle.fontSize,
                fontFamily: questionStyle.fontFamily,
              }}
              aria-hidden="true"
            >
              {masterNum}.
            </span>
            <div className="flex-1 w-full min-w-0">
              <ComprehensionEditableText
                text={data.passage}
                itemKey={`seen-comp-context-${data.id || item.id}`}
                defaultStyle={contextStyle}
                className="text-justify font-body leading-relaxed w-full"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Sub-Questions by Group */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        {groupKeys.map((gNum, gIdx) => {
          const groupItems = groupedQuestions[gNum] || [];
          const groupTitle = groupItems[0]?.groupTitle;
          const assignedNum = groupToQuestionNumMap.get(gNum) ?? gNum;

          const isTrueFalseGroup = 
            groupItems[0]?.type === "TRUE_FALSE" ||
            groupItems.some((sq: any) => sq.type === "TRUE_FALSE") ||
            (groupTitle?.toLowerCase().includes("true") ?? false) ||
            (groupTitle?.toLowerCase().includes("false") ?? false) ||
            (groupTitle?.includes("সত্য") ?? false) ||
            (groupTitle?.includes("মিথ্যা") ?? false);

          const isMcqGroup = 
            !isTrueFalseGroup && (
              groupItems[0]?.type === "MCQ" ||
              (groupTitle?.toLowerCase().includes("choose") ?? false) ||
              (groupTitle?.toLowerCase().includes("mcq") ?? false) ||
              (groupTitle?.includes("সঠিক উত্তর") ?? false) ||
              groupItems.some((sq: any) => {
                const rawOptions = typeof sq.options === "string" ? JSON.parse(sq.options || "[]") : sq.options || [];
                return Array.isArray(rawOptions) && rawOptions.length > 0;
              })
            );

          const count = groupItems.length;
          const balanced = balancedMarksMap[gNum];
          let totalGroupMarks: number;
          let marksPerItem: number;

          if (balanced) {
            totalGroupMarks = balanced.totalGroupMarks;
            marksPerItem = balanced.marksPerItem;
          } else {
            const defaultSingleMark = Number(groupItems[0]?.marks ?? 1);
            const computedSum = groupItems.reduce(
              (sum: number, sq: any) => sum + (sq.marks !== undefined && sq.marks !== null && !isNaN(Number(sq.marks)) ? Number(sq.marks) : defaultSingleMark),
              0
            );
            totalGroupMarks = Math.round(computedSum * 100) / 100;
            marksPerItem = count > 0 ? Math.round((totalGroupMarks / count) * 100) / 100 : defaultSingleMark;
          }

          let defaultTitle = "Answer the following questions:";
          if (isMcqGroup) {
            defaultTitle = "Choose the correct answer from the following alternatives:";
          } else if (isTrueFalseGroup) {
            defaultTitle = "Write 'True' for correct statement and 'False' for incorrect statement.";
          }

          let rawGroupTitle = groupTitle || defaultTitle;
          if (
            isTrueFalseGroup &&
            (!groupTitle ||
              groupTitle.toLowerCase().includes("write whether the following statements are true or false"))
          ) {
            rawGroupTitle = "Write 'True' for correct statement and 'False' for incorrect statement.";
          }

          const cleanGroupTitle = rawGroupTitle
            .replace(/^\d+[\.\)\s]+/, "")
            .trim();

          return (
            <div key={gNum} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-start w-full">
                <div 
                  className="font-bold ml-[0px] flex items-baseline gap-2 flex-1" 
                  style={{
                    fontSize: questionStyle.fontSize,
                    fontFamily: questionStyle.fontFamily,
                  }}
                >
                  <span
                    className="font-bold shrink-0 min-w-[1.8em]"
                    style={{
                      fontSize: questionStyle.fontSize,
                      fontFamily: questionStyle.fontFamily,
                    }}
                  >
                    {assignedNum}.
                  </span>
                  <span className="flex-1 font-bold">
                    <RenderMath text={cleanGroupTitle} />
                  </span>
                </div>
                {groupItems.length > 0 && (
                  <div
                    className="font-bold whitespace-nowrap text-right shrink-0 ml-2"
                    style={{
                      fontSize: questionStyle.fontSize,
                      fontFamily: questionStyle.fontFamily,
                    }}
                  >
                    {groupItems.length > 1
                      ? `${marksPerItem} × ${groupItems.length} = ${totalGroupMarks}`
                      : `${totalGroupMarks}`}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-0.5">
                {groupItems.map((sq: any, sIdx: number) => {
                  const subLabel = sq.itemLabel || String.fromCharCode(97 + sIdx); // a, b, c...
                  const rawOptions = typeof sq.options === "string" ? JSON.parse(sq.options || "[]") : sq.options || [];
                  const optionsList = Array.isArray(rawOptions) ? rawOptions : [];
                  const columns = settings.mcqOptionLayouts?.[sq.id] || settings.mcqOptionColumns || (optionsList.length > 2 ? 2 : optionsList.length);
                  const gridClass = columns === 1 ? "grid-cols-1" : columns === 4 ? "grid-cols-4" : "grid-cols-2";

                  return (
                    <div key={sq.id || sIdx} className="flex items-start gap-2 w-full group/item relative">
                      <span
                        className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
                        style={{
                          fontSize: questionStyle.fontSize,
                          fontFamily: questionStyle.fontFamily,
                        }}
                        aria-hidden="true"
                      >
                        {assignedNum}.
                      </span>
                      <div className="flex-1 w-full min-w-0 flex flex-col gap-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <div 
                            className="flex items-baseline gap-1.5 flex-1"
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                            }}
                          >
                            <span className="font-bold shrink-0 min-w-[1.6em]">
                              ({subLabel})
                            </span>
                            <span 
                              className={`flex-1 ${isMcqGroup ? "font-bold" : "font-body"}`} 
                              style={{ fontWeight: isMcqGroup ? "bold" : "normal" }}
                            >
                              <RenderMath text={sq.question} />
                            </span>
                          </div>

                          {isMcqGroup && optionsList.length > 0 && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center bg-white border shadow-xs rounded px-0.5 print:hidden">
                                <button 
                                  type="button"
                                  onClick={() => setMcqOptionLayout(sq.id, 1)}
                                  className={`px-1 py-0.5 text-[10px] leading-none hover:bg-muted rounded transition-colors ${columns === 1 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
                                  title="1 Option per row"
                                >
                                  1
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setMcqOptionLayout(sq.id, 2)}
                                  className={`px-1 py-0.5 text-[10px] leading-none hover:bg-muted border-l transition-colors ${columns === 2 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
                                  title="2 Options per row"
                                >
                                  2
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setMcqOptionLayout(sq.id, 4)}
                                  className={`px-1 py-0.5 text-[10px] leading-none hover:bg-muted border-l transition-colors ${columns === 4 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
                                  title="4 Options per row"
                                >
                                  4
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Render Options with dot-type indicator */}
                        {isMcqGroup && optionsList.length > 0 && (
                          <div 
                            className={`grid gap-x-2 gap-y-0 mt-0 pl-6 font-normal ${gridClass}`}
                            style={{
                              fontSize: questionStyle.fontSize,
                              fontFamily: questionStyle.fontFamily,
                              lineHeight: questionStyle.lineHeight,
                              fontWeight: "normal",
                            }}
                          >
                            {optionsList.map((opt: any, oIdx: number) => {
                              const rawOptText = typeof opt === "string" ? opt : opt.text || opt.label || "";
                              const optText = rawOptText
                                .replace(/^(\([a-zA-Z0-9ivxIVX\u0980-\u09FF]+\)|[a-zA-Z0-9ivxIVX\u0980-\u09FF]+[\.\)])\s*/, "")
                                .trim();

                              const romanNumerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
                              const rawKey = typeof opt === "object" && opt?.key 
                                ? (["j", "k", "l", "m"].includes(String(opt.key).toLowerCase()) ? romanNumerals[oIdx] : opt.key)
                                : (romanNumerals[oIdx] || String(oIdx + 1));
                              const cleanKey = String(rawKey).replace(/^\(+|\)+$/g, "").replace(/\.$/, "").trim();

                              return (
                                <div 
                                  key={oIdx} 
                                  className="flex items-baseline gap-1 w-full font-normal" 
                                  style={{
                                    fontSize: questionStyle.fontSize,
                                    fontFamily: questionStyle.fontFamily,
                                    fontWeight: "normal",
                                  }}
                                >
                                  {renderOptionLabel(cleanKey)}
                                  <span className="flex-1 font-normal min-w-0" style={{ fontWeight: "normal" }}>
                                    <RenderMath text={optText} />
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternative question renderer if any */}
      {item.alternatives && item.alternatives.length > 0 && (
        <div className="mt-2 border-t border-dashed pt-2">
          <AlternativeQuestionRenderer
            paperId={paperId || ""}
            parentQuestionId={item.id}
            alternatives={item.alternatives}
            settings={settings}
            masterNumber={masterNum}
            primaryMarks={totalMarks}
          />
        </div>
      )}

      {/* Add Alternative Modal */}
      <AddAlternativeModal
        open={showAddAlternative}
        onOpenChange={setShowAddAlternative}
        paperId={paperId || ""}
        primaryQuestionId={item.id}
        primaryQuestionContentId={data.id}
        primaryQuestionType={data.comprehensionType || "SEEN_COMPREHENSION_1"}
        subjectId={item.subjectId || distStatus?.subjectId || ""}
        primaryMarks={totalMarks}
        masterNumber={masterNum}
        distributionId={item.distributionId || data.distributionId || distStatus?.distributionId}
      />

      {/* Sub-Questions Selection / Configuration Dialog */}
      <Dialog open={subQuestionsModalOpen} onOpenChange={setSubQuestionsModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col font-body">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-headline">
              <ListFilter className="w-4 h-4 text-primary" />
              উপ-প্রশ্নসমূহ নির্বাচন ও পরিচালনা
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-2 text-xs">
            {/* Quick Group Select Pills */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
              <span className="text-muted-foreground font-medium">দ্রুত নির্বাচন:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {allGroupKeys.map((gNum) => {
                  const gSubIds = (allGroupedQuestions[gNum] || []).map((sq) => sq.id);
                  return (
                    <Button
                      key={gNum}
                      variant="outline"
                      size="sm"
                      onClick={() => setTempSelectedSubIds(gSubIds)}
                      className="h-7 text-xs px-2 gap-1 cursor-pointer font-body"
                    >
                      <Layers className="w-3 h-3 text-primary" />
                      গ্রুপ {toBengaliDigits(gNum)} ({toBengaliDigits(gSubIds.length)})
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTempSelectedSubIds(allAvailableQuestions.map((sq) => sq.id))}
                  className="h-7 text-xs px-2 cursor-pointer font-body"
                >
                  সব ({toBengaliDigits(allAvailableQuestions.length)})
                </Button>
              </div>
            </div>

            {/* Sub-questions checklist by group */}
            <div className="space-y-3">
              {allGroupKeys.map((gNum) => {
                const groupItems = allGroupedQuestions[gNum] || [];
                const groupTitle = groupItems[0]?.groupTitle;

                return (
                  <div key={gNum} className="space-y-1.5">
                    {groupTitle && (
                      <div className="font-bold text-foreground text-xs bg-muted/40 p-1.5 rounded flex items-center justify-between">
                        <span><RenderMath text={groupTitle} /></span>
                        <Badge variant="secondary" className="text-[10px]">
                          গ্রুপ {toBengaliDigits(gNum)}
                        </Badge>
                      </div>
                    )}

                    <div className="space-y-1 pl-1">
                      {groupItems.map((sq: any, idx: number) => {
                        const checked = tempSelectedSubIds.includes(sq.id);
                        const label = sq.itemLabel || String.fromCharCode(97 + idx);

                        return (
                          <div
                            key={sq.id || idx}
                            onClick={() => {
                              setTempSelectedSubIds((prev) =>
                                prev.includes(sq.id)
                                  ? prev.filter((id) => id !== sq.id)
                                  : [...prev, sq.id]
                              );
                            }}
                            className={cn(
                              "flex items-start justify-between gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors",
                              checked
                                ? "bg-primary/[0.04] border-primary/40 text-foreground"
                                : "bg-card/40 border-border/40 hover:bg-muted/30 text-muted-foreground"
                            )}
                          >
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <div className="mt-0.5 shrink-0 text-primary">
                                {checked ? (
                                  <CheckSquare className="w-4 h-4 text-primary fill-primary/10" />
                                ) : (
                                  <Square className="w-4 h-4 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-primary mr-1">({label})</span>
                                <span className="font-medium text-foreground/90">
                                  <RenderMath text={sq.question} />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between pt-2 border-t gap-2 sm:gap-0">
            <div className="text-xs text-muted-foreground font-semibold">
              নির্বাচিত: {toBengaliDigits(tempSelectedSubIds.length)}/{toBengaliDigits(allAvailableQuestions.length)}টি প্রশ্ন
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubQuestionsModalOpen(false)}
                className="cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                size="sm"
                disabled={isUpdatingQuestion || tempSelectedSubIds.length === 0}
                onClick={handleSaveSubQuestionsConfig}
                className="cursor-pointer"
              >
                {isUpdatingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "সংরক্ষণ করুন"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
