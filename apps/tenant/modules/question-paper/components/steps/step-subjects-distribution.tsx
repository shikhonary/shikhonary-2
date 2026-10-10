"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Loader2, Calculator, Sparkles, Info } from "lucide-react"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/sonner"
import type { StepProps, WizardSubject, WizardDistribution, AcademicSubjectRef, QuestionTypeRef } from "../../types/create-wizard"

interface StepSubjectsDistributionProps extends StepProps {
  subjects: AcademicSubjectRef[]
  questionTypes: QuestionTypeRef[]
  isLoading: boolean
}

export function StepSubjectsDistribution({
  data,
  onChange,
  errors,
  subjects,
  questionTypes,
  isLoading,
}: StepSubjectsDistributionProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [showAutoFillToast, setShowAutoFillToast] = useState(false)

  // Distribution form state per subject
  const [distForm, setDistForm] = useState<{
    questionTypeId: string
    marksPerQuestion: string
    questionCount: string
    questionsToAttempt: string
  }>({
    questionTypeId: "",
    marksPerQuestion: "",
    questionCount: "",
    questionsToAttempt: "",
  })

  const resetDistForm = () => {
    setDistForm({ questionTypeId: "", marksPerQuestion: "", questionCount: "", questionsToAttempt: "" })
  }

  // Get currently expanded subject's subjectId
  const expandedSubjectObj = data.subjects.find((s) => s.tempId === expandedSubject)
  const expandedSubjectId = expandedSubjectObj?.subjectId || ""

  // Query for the expanded subject's details (to get subjectQuestionTypes)
  const { data: subjectDetail, isLoading: isDetailLoading } = useQuery({
    ...trpc.academicSubject.byId.queryOptions({ id: expandedSubjectId }),
    enabled: !!expandedSubjectId,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const allowedQuestionTypeIds = subjectDetail?.subjectQuestionTypes && subjectDetail.subjectQuestionTypes.length > 0
    ? new Set(subjectDetail.subjectQuestionTypes.map((sqt: any) => sqt.questionTypeId))
    : null;

  const filteredQuestionTypes = allowedQuestionTypeIds
    ? questionTypes.filter((t) => allowedQuestionTypeIds.has(t.id))
    : questionTypes;

  // Add subject manually (starts with empty distributions)
  const handleAddSubject = () => {
    if (!selectedSubjectId) return
    if (data.subjects.some((s) => s.subjectId === selectedSubjectId)) return

    const matched = subjects.find((s) => s.id === selectedSubjectId)
    if (!matched) return

    const newSubject: WizardSubject = {
      tempId: crypto.randomUUID(),
      subjectId: matched.id,
      subjectName: matched.nameBn || matched.nameEn,
      distributions: [],
    }

    onChange({ subjects: [...data.subjects, newSubject] })
    setSelectedSubjectId("")
    setExpandedSubject(newSubject.tempId)
  }

  // Remove subject
  const handleRemoveSubject = (tempId: string) => {
    onChange({ subjects: data.subjects.filter((s) => s.tempId !== tempId) })
    if (expandedSubject === tempId) setExpandedSubject(null)
  }

  // Handle question type selection & autofill distribution inputs
  const handleQuestionTypeChange = (qTypeId: string) => {
    const matchedGlobal = questionTypes.find((t) => t.id === qTypeId)
    if (!matchedGlobal) return

    // Find if there is a custom preset in subjectDetail.subjectQuestionTypes
    const preset = subjectDetail?.subjectQuestionTypes?.find(
      (sqt: any) => sqt.questionTypeId === qTypeId
    )

    setDistForm({
      questionTypeId: qTypeId,
      marksPerQuestion: preset ? String(preset.mark) : String(matchedGlobal.mark || 1),
      questionCount: preset ? String(preset.totalQuestions || 0) : "",
      questionsToAttempt: preset && preset.requiredCount > 0 ? String(preset.requiredCount) : "",
    })

    if (preset) {
      setShowAutoFillToast(true)
      setTimeout(() => setShowAutoFillToast(false), 2000)
    }
  }

  const handleQuestionCountBlur = () => {
    const tot = parseInt(distForm.questionCount, 10) || 0
    const req = parseInt(distForm.questionsToAttempt, 10) || 0
    if (distForm.questionsToAttempt !== "" && tot < req) {
      setDistForm((p) => ({ ...p, questionsToAttempt: p.questionCount }))
    }
  }

  const handleQuestionsToAttemptBlur = () => {
    const tot = parseInt(distForm.questionCount, 10) || 0
    const req = parseInt(distForm.questionsToAttempt, 10) || 0
    if (distForm.questionsToAttempt !== "" && tot < req) {
      setDistForm((p) => ({ ...p, questionCount: p.questionsToAttempt }))
    }
  }

  // Add distribution to a subject
  const handleAddDistribution = (subjectTempId: string) => {
    if (!distForm.questionTypeId || !distForm.marksPerQuestion || !distForm.questionCount) return

    const matched = questionTypes.find((t) => t.id === distForm.questionTypeId)
    if (!matched) return

    let finalQuestionCount = parseInt(distForm.questionCount, 10)
    const finalQuestionsToAttempt = distForm.questionsToAttempt ? parseInt(distForm.questionsToAttempt, 10) : null

    if (finalQuestionsToAttempt !== null && finalQuestionCount < finalQuestionsToAttempt) {
      finalQuestionCount = finalQuestionsToAttempt
      toast.info("চেষ্টার সংখ্যা অনুযায়ী মোট প্রশ্ন সংখ্যা সমন্বয় করা হয়েছে।")
    }

    const marksNum = parseFloat(distForm.marksPerQuestion)

    // Check if preset exists in subjectDetail
    const preset = subjectDetail?.subjectQuestionTypes?.find(
      (sqt: any) => sqt.questionTypeId === distForm.questionTypeId
    )

    let markDist: any = preset?.markDistribution
    if (typeof markDist === "string") {
      try {
        markDist = JSON.parse(markDist)
      } catch {
        markDist = null
      }
    }

    if (markDist && typeof markDist === "object" && !Array.isArray(markDist)) {
      const keys = Object.keys(markDist)
      if (keys.length === 1) {
        markDist = { [keys[0]!]: marksNum }
      } else if (keys.length > 1) {
        const sum = Object.values(markDist).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
        if (sum !== marksNum && sum > 0) {
          const ratio = marksNum / sum
          const scaled: Record<string, number> = {}
          for (const k of keys) {
            scaled[k] = Math.round(((Number(markDist[k]) || 0) * ratio) * 100) / 100
          }
          markDist = scaled
        }
      }
    } else {
      markDist = { a: marksNum }
    }

    const distribution: WizardDistribution = {
      tempId: crypto.randomUUID(),
      questionTypeId: matched.id,
      questionTypeName: matched.nameBn || matched.nameEn,
      questionTypeNameBn: matched.nameBn || null,
      questionTypeLabel: (preset as any)?.customLabel || (preset as any)?.questionTypeLabel || (matched as any).label || matched.nameBn || matched.nameEn,
      marksPerQuestion: marksNum,
      markDistribution: markDist,
      questionCount: finalQuestionCount,
      questionsToAttempt: finalQuestionsToAttempt,
      orderIndex: 0,
    }

    const updatedSubjects = data.subjects.map((s) => {
      if (s.tempId !== subjectTempId) return s
      // Avoid duplicate distribution question types within the same subject
      const filteredDists = s.distributions.filter(d => d.questionTypeId !== matched.id)
      const newDists = [...filteredDists, distribution].map((d, i) => ({ ...d, orderIndex: i }))
      return { ...s, distributions: newDists }
    })

    onChange({ subjects: updatedSubjects })
    resetDistForm()
  }

  // Remove distribution from a subject
  const handleRemoveDistribution = (subjectTempId: string, distTempId: string) => {
    const updatedSubjects = data.subjects.map((s) => {
      if (s.tempId !== subjectTempId) return s
      const filtered = s.distributions
        .filter((d) => d.tempId !== distTempId)
        .map((d, i) => ({ ...d, orderIndex: i }))
      return { ...s, distributions: filtered }
    })
    onChange({ subjects: updatedSubjects })
  }

  // Calculate totals
  const getSubjectTotal = (subject: WizardSubject) =>
    subject.distributions.reduce((sum, d) => sum + d.marksPerQuestion * (d.questionsToAttempt ?? d.questionCount), 0)

  const grandTotal = data.subjects.reduce((sum, s) => sum + getSubjectTotal(s), 0)

  // Already-added subject IDs for filtering
  const addedSubjectIds = new Set(data.subjects.map((s) => s.subjectId))
  const availableSubjects = subjects.filter((s) => !addedSubjectIds.has(s.id))

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center font-body">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-sm text-outline">তথ্য লোড হচ্ছে...</span>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-5 sm:p-6 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 border border-indigo-100 dark:border-primary/20 text-indigo-600 dark:text-primary shrink-0">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline text-base sm:text-lg font-bold text-foreground normal-case tracking-normal">
            বিষয় ও নম্বর বণ্টন
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            বিষয় যোগ করুন এবং প্রতিটি বিষয়ে প্রশ্নের ধরণ অনুযায়ী নম্বর বণ্টন নির্ধারণ করুন
          </p>
        </div>
        {grandTotal > 0 && (
          <Badge className="bg-indigo-600 text-white px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl shrink-0 font-solaiman shadow-xs">
            মোট: {grandTotal} নম্বর
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6 font-body">
        <div className="flex items-start gap-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 text-foreground font-body">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            এই ধাপে পরীক্ষার জন্য এক বা একাধিক বিষয় যোগ করতে পারবেন। বিষয় যোগ করার পর তার কার্ডটি উন্মুক্ত করে নির্দিষ্ট প্রশ্নের ধরণ সিলেক্ট করলে পূর্বনির্ধারিত নম্বর ও সংখ্যা ফর্মে বসে যাবে।
          </p>
        </div>

        {/* Subject error */}
        {errors.subjects && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-body">{errors.subjects}</p>
        )}

        {/* Add Subject */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] py-2.5 px-4 font-body text-xs sm:text-sm transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 h-11 justify-between">
                <SelectValue placeholder={data.classId ? "বিষয় নির্বাচন করুন" : "প্রথমে শ্রেণী নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                {availableSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameBn || s.nameEn}
                  </SelectItem>
                ))}
                {availableSubjects.length === 0 && data.classId && (
                  <div className="px-3 py-2 text-xs text-muted-foreground font-body">
                    এই শ্রেণীর জন্য আর কোনো বিষয় নেই
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleAddSubject}
            disabled={!selectedSubjectId}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-5 h-11 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs font-headline shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>বিষয় যোগ করুন</span>
          </Button>
        </div>

        {/* No class selected hint */}
        {!data.classId && (
          <div className="flex items-start gap-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low/50 p-3 text-outline font-body">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              বিষয় তালিকা দেখতে প্রথমে ধাপ ১ এ শ্রেণী নির্বাচন করুন।
            </p>
          </div>
        )}

        {/* Subject Cards */}
        {data.subjects.length > 0 && (
          <div className="space-y-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
            {data.subjects.map((subject, sIdx) => {
              const subjectTotal = getSubjectTotal(subject)
              const isExpanded = expandedSubject === subject.tempId
              const distError = errors[`subject_${sIdx}_distributions`]

              return (
                <div
                  key={subject.tempId}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card overflow-hidden shadow-2xs"
                >
                  {/* Subject header */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSubject(isExpanded ? null : subject.tempId)
                      resetDistForm()
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary text-xs font-bold shrink-0 font-solaiman">
                      {sIdx + 1}
                    </span>
                    <span className="flex-1 text-left font-bold text-sm text-foreground font-headline">
                      {subject.subjectName}
                    </span>
                    {subject.distributions.length > 0 && (
                      <Badge className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-0.5 text-xs font-bold rounded-lg font-solaiman">
                        {subjectTotal} নম্বর
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 space-y-4 bg-slate-50/30 dark:bg-white/[0.01]">
                      {/* Distribution error */}
                      {distError && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-body">{distError}</p>
                      )}

                      {/* Distributions list - Responsive Card list on mobile & Table on sm+ */}
                      {subject.distributions.length > 0 && (
                        <div>
                          {/* Mobile Cards (sm:hidden) */}
                          <div className="space-y-2 sm:hidden">
                            {subject.distributions.map((dist) => (
                              <div
                                key={dist.tempId}
                                className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-2xs space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-bold text-foreground font-headline">
                                      {dist.questionTypeNameBn || dist.questionTypeName}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      প্রতি প্রশ্নে: <span className="font-semibold text-foreground font-solaiman">{dist.marksPerQuestion}</span> নম্বর
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleRemoveDistribution(subject.tempId, dist.tempId)}
                                    className="h-7 w-7 rounded-lg p-0 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
                                  <div className="flex items-center gap-3 text-muted-foreground font-body">
                                    <span>সংখ্যা: <strong className="text-foreground font-solaiman">{dist.questionCount}</strong></span>
                                    <span>চেষ্টা: <strong className="text-foreground font-solaiman">{dist.questionsToAttempt ?? "সব"}</strong></span>
                                  </div>
                                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-solaiman">
                                    মোট: {dist.marksPerQuestion * (dist.questionsToAttempt ?? dist.questionCount)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Desktop Table (hidden sm:block) */}
                          <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card">
                            <table className="w-full text-xs font-body">
                              <thead>
                                <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-muted-foreground">
                                  <th className="text-left py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">ধরণ</th>
                                  <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">নম্বর/প্রশ্ন</th>
                                  <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">প্রশ্ন সংখ্যা</th>
                                  <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">চেষ্টা</th>
                                  <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">মোট</th>
                                  <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                {subject.distributions.map((dist) => (
                                  <tr key={dist.tempId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-3 font-semibold text-foreground">{dist.questionTypeNameBn || dist.questionTypeName}</td>
                                    <td className="py-2.5 px-3 text-center text-muted-foreground font-solaiman">{dist.marksPerQuestion}</td>
                                    <td className="py-2.5 px-3 text-center text-muted-foreground font-solaiman">{dist.questionCount}</td>
                                    <td className="py-2.5 px-3 text-center text-muted-foreground font-solaiman">
                                      {dist.questionsToAttempt ?? "সব"}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 font-solaiman">
                                      {dist.marksPerQuestion * (dist.questionsToAttempt ?? dist.questionCount)}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoveDistribution(subject.tempId, dist.tempId)}
                                        className="h-7 w-7 rounded-lg p-0 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Add distribution form */}
                      <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/50 p-3.5 sm:p-4 space-y-3 bg-indigo-50/30 dark:bg-indigo-950/10">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-headline">নতুন প্রশ্নের ধরণ ও নম্বর বণ্টন যোগ করুন</p>
                          {isDetailLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 shrink-0" />
                          )}
                        </div>

                        {showAutoFillToast && (
                          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-body animate-in fade-in duration-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>নম্বর ও প্রশ্ন সংখ্যা স্বয়ংক্রিয়ভাবে পূরণ হয়েছে!</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="sm:col-span-1">
                            <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">প্রশ্নের ধরণ *</label>
                            <Select value={distForm.questionTypeId} onValueChange={handleQuestionTypeChange}>
                              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card py-2 px-3 font-body text-xs h-10 justify-between">
                                <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                                {filteredQuestionTypes.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.nameBn || t.nameEn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:contents">
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">নম্বর/প্রশ্ন *</label>
                              <Input
                                type="number"
                                value={distForm.marksPerQuestion}
                                onChange={(e) => setDistForm((p) => ({ ...p, marksPerQuestion: e.target.value }))}
                                placeholder="১"
                                min={0.5}
                                step={0.5}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">প্রশ্ন সংখ্যা *</label>
                              <Input
                                type="number"
                                value={distForm.questionCount}
                                onChange={(e) => setDistForm((p) => ({ ...p, questionCount: e.target.value }))}
                                onBlur={handleQuestionCountBlur}
                                placeholder="১০"
                                min={0}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">চেষ্টা (ঐচ্ছিক)</label>
                              <Input
                                type="number"
                                value={distForm.questionsToAttempt}
                                onChange={(e) => setDistForm((p) => ({ ...p, questionsToAttempt: e.target.value }))}
                                onBlur={handleQuestionsToAttemptBlur}
                                placeholder="সব"
                                min={1}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10"
                              />
                            </div>
                          </div>
                        </div>

                        {distForm.questionsToAttempt !== "" && (parseInt(distForm.questionCount, 10) || 0) < (parseInt(distForm.questionsToAttempt, 10) || 0) && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-body font-medium animate-in fade-in duration-200">
                            ⚠️ চেষ্টার সংখ্যা মোট প্রশ্ন সংখ্যার চেয়ে বেশি হতে পারবে না।
                          </p>
                        )}

                        {(() => {
                          const isFormInvalid =
                            !distForm.questionTypeId ||
                            !distForm.marksPerQuestion ||
                            !distForm.questionCount ||
                            (distForm.questionsToAttempt !== "" && (parseInt(distForm.questionCount, 10) || 0) < (parseInt(distForm.questionsToAttempt, 10) || 0))

                          return (
                            <Button
                              type="button"
                              onClick={() => handleAddDistribution(subject.tempId)}
                              disabled={isFormInvalid}
                              className={`flex items-center gap-1.5 rounded-xl px-4 h-9 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer font-headline ${
                                isFormInvalid
                                  ? "bg-slate-200 dark:bg-white/10 text-muted-foreground"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                              }`}
                            >
                              <Calculator className="h-3.5 w-3.5" />
                              <span>নম্বর বণ্টন যোগ করুন</span>
                            </Button>
                          )
                        })()}
                      </div>

                      {/* Subject actions */}
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveSubject(subject.tempId)}
                          className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs rounded-xl px-3 py-1.5 cursor-pointer h-auto font-headline font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>বিষয় ডিলিট করুন</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Grand Total */}
        {data.subjects.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 dark:border-indigo-800/50 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 font-headline shadow-2xs">
            <span className="text-sm font-bold text-foreground">সর্বমোট নম্বর</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-solaiman">{grandTotal}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
