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
      questionTypeLabel: (preset as any)?.questionTypeLabel || (matched as any).label || matched.nameBn || matched.nameEn,
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
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
            বিষয় ও নম্বর বণ্টন
          </CardTitle>
          <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5 font-body">
            বিষয় যোগ করুন এবং প্রতিটি বিষয়ে প্রশ্নের ধরণ অনুযায়ী নম্বর বণ্টন নির্ধারণ করুন
          </p>
        </div>
        {grandTotal > 0 && (
          <Badge className="bg-primary text-white px-3 py-1 text-sm font-bold rounded-lg shrink-0">
            মোট: {grandTotal}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-6">
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-on-surface font-body">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            এই ধাপে পরীক্ষার জন্য এক বা একাধিক বিষয় যোগ করতে পারবেন। বিষয় যোগ করার পর তার কার্ডটি উন্মুক্ত করে নির্দিষ্ট প্রশ্নের ধরণ সিলেক্ট করলে পূর্বনির্ধারিত নম্বর ও সংখ্যা ফর্মে বসে যাবে।
          </p>
        </div>

        {/* Subject error */}
        {errors.subjects && (
          <p className="text-xs text-error font-body">{errors.subjects}</p>
        )}

        {/* Add Subject */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2.5 px-4 font-body text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 h-auto justify-between">
                <SelectValue placeholder={data.classId ? "বিষয় নির্বাচন করুন" : "প্রথমে শ্রেণী নির্বাচন করুন"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-body">
                {availableSubjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nameBn || s.nameEn}
                  </SelectItem>
                ))}
                {availableSubjects.length === 0 && data.classId && (
                  <div className="px-3 py-2 text-xs text-outline font-body">
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
            className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 font-bold text-on-primary-container text-sm transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal font-display shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>বিষয় যোগ</span>
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
          <div className="space-y-4 border-t border-outline-variant/40 pt-6">
            {data.subjects.map((subject, sIdx) => {
              const subjectTotal = getSubjectTotal(subject)
              const isExpanded = expandedSubject === subject.tempId
              const distError = errors[`subject_${sIdx}_distributions`]

              return (
                <div
                  key={subject.tempId}
                  className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden"
                >
                  {/* Subject header */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedSubject(isExpanded ? null : subject.tempId)
                      resetDistForm()
                    }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {sIdx + 1}
                    </span>
                    <span className="flex-1 text-left font-bold text-sm text-on-surface font-display">
                      {subject.subjectName}
                    </span>
                    {subject.distributions.length > 0 && (
                      <Badge className="bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold rounded-md">
                        {subjectTotal} নম্বর
                      </Badge>
                    )}
                    <span className="text-outline">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-outline-variant/40 p-4 space-y-4">
                      {/* Distribution error */}
                      {distError && (
                        <p className="text-xs text-error font-body">{distError}</p>
                      )}

                      {/* Distributions table */}
                      {subject.distributions.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm font-body">
                            <thead>
                              <tr className="border-b border-outline-variant/40">
                                <th className="text-left py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider">ধরণ</th>
                                <th className="text-center py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider">নম্বর/প্রশ্ন</th>
                                <th className="text-center py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider">প্রশ্ন সংখ্যা</th>
                                <th className="text-center py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider">চেষ্টা</th>
                                <th className="text-center py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider">মোট</th>
                                <th className="text-center py-2 px-2 text-[11px] font-medium text-outline uppercase tracking-wider w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {subject.distributions.map((dist) => (
                                <tr key={dist.tempId} className="border-b border-outline-variant/20 last:border-0">
                                  <td className="py-2 px-2 font-medium text-on-surface">{dist.questionTypeName}</td>
                                  <td className="py-2 px-2 text-center text-on-surface-variant">{dist.marksPerQuestion}</td>
                                  <td className="py-2 px-2 text-center text-on-surface-variant">{dist.questionCount}</td>
                                  <td className="py-2 px-2 text-center text-on-surface-variant">
                                    {dist.questionsToAttempt ?? "সব"}
                                  </td>
                                  <td className="py-2 px-2 text-center font-bold text-primary">
                                    {dist.marksPerQuestion * (dist.questionsToAttempt ?? dist.questionCount)}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => handleRemoveDistribution(subject.tempId, dist.tempId)}
                                      className="h-7 w-7 rounded-md p-0 hover:bg-error-container text-error cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Add distribution form */}
                      <div className="rounded-lg border border-dashed border-outline-variant/60 p-4 space-y-3 bg-surface-container-low/30">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] font-bold text-outline uppercase tracking-wider font-display">নম্বর বণ্টন যোগ করুন</p>
                          {isDetailLoading && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                          )}
                        </div>

                        {showAutoFillToast && (
                          <div className="flex items-center gap-1.5 text-primary text-[11px] font-body animate-in fade-in duration-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>নম্বর ও প্রশ্ন সংখ্যা স্বয়ংক্রিয়ভাবে পূরণ হয়েছে!</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="text-[10px] text-outline font-body mb-1 block">প্রশ্নের ধরণ *</label>
                            <Select value={distForm.questionTypeId} onValueChange={handleQuestionTypeChange}>
                              <SelectTrigger className="w-full rounded-lg border border-outline-variant bg-white py-2 px-3 font-body text-xs h-auto justify-between">
                                <SelectValue placeholder="ধরণ" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg font-body">
                                {filteredQuestionTypes.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.nameBn || t.nameEn}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-[10px] text-outline font-body mb-1 block">নম্বর/প্রশ্ন *</label>
                            <Input
                              type="number"
                              value={distForm.marksPerQuestion}
                              onChange={(e) => setDistForm((p) => ({ ...p, marksPerQuestion: e.target.value }))}
                              placeholder="1"
                              min={0.5}
                              step={0.5}
                              className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body text-xs text-on-surface bg-white focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-outline font-body mb-1 block">প্রশ্ন সংখ্যা *</label>
                            <Input
                              type="number"
                              value={distForm.questionCount}
                              onChange={(e) => setDistForm((p) => ({ ...p, questionCount: e.target.value }))}
                              onBlur={handleQuestionCountBlur}
                              placeholder="10"
                              min={0}
                              className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body text-xs text-on-surface bg-white focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-outline font-body mb-1 block">চেষ্টা (ঐচ্ছিক)</label>
                            <Input
                              type="number"
                              value={distForm.questionsToAttempt}
                              onChange={(e) => setDistForm((p) => ({ ...p, questionsToAttempt: e.target.value }))}
                              onBlur={handleQuestionsToAttemptBlur}
                              placeholder="সব"
                              min={1}
                              className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body text-xs text-on-surface bg-white focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                            />
                          </div>
                        </div>

                        {distForm.questionsToAttempt !== "" && (parseInt(distForm.questionCount, 10) || 0) < (parseInt(distForm.questionsToAttempt, 10) || 0) && (
                          <p className="text-[11px] text-error font-body font-medium animate-in fade-in duration-200">
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
                              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal font-display ${
                                isFormInvalid
                                  ? "bg-primary-container/40 text-on-primary-container/60"
                                  : "bg-primary-container text-on-primary-container hover:bg-primary hover:text-white"
                              }`}
                            >
                              <Calculator className="h-3.5 w-3.5" />
                              <span>যোগ করুন</span>
                            </Button>
                          )
                        })()}
                      </div>

                      {/* Subject actions */}
                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveSubject(subject.tempId)}
                          className="flex items-center gap-1.5 text-error hover:bg-error-container text-xs rounded-lg px-3 py-1.5 cursor-pointer h-auto font-display"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>বিষয় সরান</span>
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
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4 font-display">
            <span className="text-sm font-bold text-primary">সর্বমোট নম্বর</span>
            <span className="text-2xl font-extrabold text-primary">{grandTotal}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
