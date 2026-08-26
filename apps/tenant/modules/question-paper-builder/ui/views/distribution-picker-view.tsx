"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Loader2, Save, Search, CheckCircle2 } from "lucide-react";
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

  const { mutateAsync: bulkAssign, isPending: isAssigning } = useBulkAssignQuestions();

  if (paperLoading || statusesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background font-display">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const distStatus = statuses?.find((s: any) => s.distributionId === distributionId);
  
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

  let category: "MCQ" | "CQ" | "SHORT" = "MCQ";
  if (qTypeNameEn.includes("short") || qTypeNameBn.includes("সংক্ষিপ্ত")) {
    category = "SHORT";
  } else if (qTypeNameEn.includes("creative") || qTypeNameEn.includes("cq") || qTypeNameBn.includes("সৃজনশীল")) {
    category = "CQ";
  }

  const handleSaveAndContinue = async () => {
    if (selectedIds.length === 0) return;
    try {
      if (category === "SHORT") {
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
      <header className="h-14 flex items-center justify-between px-4 border-b bg-card shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/question-papers/${paperId}/builder`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base text-primary">
              প্রশ্ন নির্বাচন: {distStatus.questionTypeName || distStatus.subjectName}
            </h1>
            <span className="text-xs text-muted-foreground font-body">
              (টার্গেট: {distStatus.targetCount}টি, যোগ হয়েছে: {distStatus.addedCount}টি)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6 pb-28">
          
          {/* Filters Bar */}
          <div className="bg-card border border-outline-variant rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="প্রশ্ন বা বিষয় দিয়ে খুঁজুন..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 font-body text-sm"
              />
            </div>
          </div>

          {/* Question Grid */}
          <QuestionGrid 
            subjectId={distStatus.subjectId}
            questionTypeId={distStatus.questionTypeId}
            category={category}
            search={search}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/30 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-8">
          <div className="text-sm font-bold text-on-surface">
            <span className="text-primary">{selectedIds.length}টি</span> নির্বাচিত
            <span className="text-muted-foreground ml-2 font-normal text-xs">
              (প্রয়োজন: {Math.max(0, distStatus.targetCount - distStatus.addedCount)}টি)
            </span>
          </div>
          <Button 
            className="rounded-full px-8 bg-primary text-white font-bold cursor-pointer gap-2"
            disabled={isAssigning}
            onClick={handleSaveAndContinue}
          >
            {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
  excludePaperId,
  selectedIds, 
  onToggle 
}: { 
  subjectId: string, 
  questionTypeId: string, 
  category: "MCQ" | "CQ" | "SHORT", 
  search: string, 
  excludePaperId: string,
  selectedIds: string[], 
  onToggle: (id: string) => void 
}) {
  const { data: result, isLoading } = useAvailableQuestions({
    subjectId,
    questionTypeId,
    category,
    search: search.trim() || undefined,
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
                  ? "border-primary ring-2 ring-primary/30 shadow-md bg-primary/5 cursor-pointer" 
                  : "hover:border-primary/50 hover:shadow-sm cursor-pointer"
            }`}
          >
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
              {q.difficulty && (
                <Badge variant="outline" className="text-[11px] font-normal capitalize">
                  {q.difficulty}
                </Badge>
              )}
            </div>

            {category === "SHORT" ? (
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
                {q.questionContext?.text && (
                  <div className="text-xs text-on-surface-variant bg-muted/40 p-2.5 rounded-xl whitespace-pre-wrap border border-outline-variant">
                    <RenderMath text={q.questionContext.text} />
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
