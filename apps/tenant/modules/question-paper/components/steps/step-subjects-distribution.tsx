"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
import { isResourceEnglish, getQuestionTypePolicy, isSingleQuestionType } from "@workspace/utils"
import type { StepProps, WizardSubject, WizardDistribution, AcademicSubjectRef, QuestionTypeRef } from "../../types/create-wizard"

interface StepSubjectsDistributionProps extends StepProps {
  subjects: AcademicSubjectRef[]
  questionTypes?: QuestionTypeRef[]
  isLoading: boolean
}

export function StepSubjectsDistribution({
  data,
  onChange,
  errors,
  subjects,
  questionTypes = [],
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

  // Auto-expand first subject if none is expanded
  useEffect(() => {
    if (data.subjects.length > 0) {
      if (!expandedSubject || !data.subjects.some((s) => s.tempId === expandedSubject)) {
        setExpandedSubject(data.subjects[0]!.tempId)
      }
    }
  }, [data.subjects, expandedSubject])

  // Get currently expanded subject's subjectId
  const expandedSubjectObj = data.subjects.find((s) => s.tempId === expandedSubject)
  const expandedSubjectId = expandedSubjectObj?.subjectId || ""
  const currentExpandedSubject = subjects.find((s) => s.id === expandedSubjectId)

  // Query question types strictly based on the expanded subject
  const { data: subjectTypesData, isLoading: isTypesLoading } = useQuery({
    ...trpc.questionType.list.queryOptions({
      subjectId: expandedSubjectId || undefined,
      limit: 100,
    }),
    enabled: !!expandedSubjectId,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const subjectQuestionTypes = (subjectTypesData?.questionTypes ?? []) as Array<{
    id: string
    nameBn: string
    nameEn: string
    label?: string | null
    mark: number
    position?: number
  }>

  // Query for the expanded subject's details (to get subjectQuestionTypes configurations and presets)
  const { data: subjectDetail, isLoading: isDetailLoading } = useQuery({
    ...trpc.academicSubject.byId.queryOptions({ id: expandedSubjectId }),
    enabled: !!expandedSubjectId,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const isExpandedSubjectEnglish = isResourceEnglish({
    subjectName: expandedSubjectObj?.subjectName,
    subjectNameEn: currentExpandedSubject?.nameEn || subjectDetail?.nameEn,
    subjectNameBn: currentExpandedSubject?.nameBn || subjectDetail?.nameBn,
  }) || (subjectDetail?.code?.toUpperCase() === "ENG" || subjectDetail?.code?.toUpperCase() === "ENGLISH");

  // Build deduplicated question types strictly for the expanded subject
  // Each questionTypeId appears at most ONCE, preventing duplicate keys and Select value clashes
  const filteredQuestionTypes = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string
        nameBn: string
        nameEn: string
        mark: number
        label?: string | null
        position: number
        preset?: any
      }
    >()

    // 1. Collect all presets from subjectDetail (deduplicated by SQT id to prevent double-counting between top-level subjectQuestionTypes and section/subSection relations)
    const seenPresetIds = new Set<string>()
    const allPresets: any[] = []

    const addPreset = (sqt: any) => {
      if (!sqt || !sqt.questionTypeId) return
      const key = sqt.id || `${sqt.subjectId || ""}_${sqt.questionTypeId}_${sqt.sectionId || ""}_${sqt.subSectionId || ""}`
      if (seenPresetIds.has(key)) return
      seenPresetIds.add(key)
      allPresets.push(sqt)
    }

    if (subjectDetail?.subjectQuestionTypes && subjectDetail.subjectQuestionTypes.length > 0) {
      for (const sqt of subjectDetail.subjectQuestionTypes) {
        addPreset(sqt)
      }
    }
    if (subjectDetail?.sections && subjectDetail.sections.length > 0) {
      for (const sec of subjectDetail.sections) {
        if (sec.subjectQuestionTypes && sec.subjectQuestionTypes.length > 0) {
          for (const sqt of sec.subjectQuestionTypes) {
            addPreset(sqt)
          }
        }
        if (sec.subSections && sec.subSections.length > 0) {
          for (const sub of sec.subSections) {
            if (sub.subjectQuestionTypes && sub.subjectQuestionTypes.length > 0) {
              for (const sqt of sub.subjectQuestionTypes) {
                addPreset(sqt)
              }
            }
          }
        }
      }
    }

    if (allPresets.length > 0) {
      const sortedPresets = [...allPresets].sort(
        (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
      )
      for (let i = 0; i < sortedPresets.length; i++) {
        const sqt = sortedPresets[i]
        if (!sqt) continue
        const qTypeId = sqt.questionTypeId
        if (!qTypeId) continue
        const isSingle = sqt.selectionMode ? (sqt.selectionMode === "SINGLE_WITH_ALT" || sqt.selectionMode === "SINGLE_NO_ALT") : (isSingleQuestionType(sqt.questionType?.nameEn || sqt.questionType?.nameBn || sqt.customLabel) || sqt.totalQuestions === 1)
        if (!map.has(qTypeId)) {
          map.set(qTypeId, {
            id: qTypeId,
            nameBn: sqt.questionType?.nameBn || "",
            nameEn: sqt.questionType?.nameEn || "",
            mark: sqt.mark || sqt.questionType?.mark || 1,
            label: sqt.customLabel || sqt.questionType?.label || sqt.questionType?.nameEn,
            position: typeof sqt.position === "number" ? sqt.position : i,
            preset: {
              ...sqt,
              totalQuestions: isSingle ? 1 : (sqt.totalQuestions || 0),
              requiredCount: isSingle ? 1 : (sqt.requiredCount || 0),
              renderMethod: sqt.renderMethod ?? 1,
            },
          })
        } else {
          const existing = map.get(qTypeId)!
          if (existing?.preset) {
            if (isSingle) {
              existing.preset.totalQuestions = 1
              existing.preset.requiredCount = 1
              existing.preset.renderMethod = sqt.renderMethod ?? existing.preset.renderMethod ?? 1
            } else {
              existing.preset.totalQuestions = (existing.preset.totalQuestions || 0) + (sqt.totalQuestions || 0)
              existing.preset.requiredCount = (existing.preset.requiredCount || 0) + (sqt.requiredCount || 0)
            }
          }
        }
      }
    }

    // 2. From subject-scoped question types query (trpc.questionType.list with subjectId)
    for (let i = 0; i < subjectQuestionTypes.length; i++) {
      const qt = subjectQuestionTypes[i]!
      if (!map.has(qt.id)) {
        map.set(qt.id, {
          id: qt.id,
          nameBn: qt.nameBn || "",
          nameEn: qt.nameEn || "",
          mark: qt.mark || 1,
          label: qt.label || qt.nameEn,
          position: typeof qt.position === "number" ? qt.position : i,
          preset: null,
        })
      } else {
        const existing = map.get(qt.id)!
        if (!existing.nameBn && qt.nameBn) existing.nameBn = qt.nameBn
        if (!existing.nameEn && qt.nameEn) existing.nameEn = qt.nameEn
        if (!existing.label && (qt.label || qt.nameEn)) existing.label = qt.label || qt.nameEn
      }
    }

    return Array.from(map.values()).sort((a, b) => a.position - b.position)
  }, [subjectDetail, subjectQuestionTypes])

  // Sync English subject names and distributions
  useEffect(() => {
    if (subjects.length > 0 && data.subjects.length > 0) {
      let changed = false
      const updated = data.subjects.map((s) => {
        const matched = subjects.find((sub) => sub.id === s.subjectId)
        if (!matched) return s

        const isEng = Boolean(
          /english|ইংরেজি/i.test(matched.nameEn || "") ||
          /english|ইংরেজি/i.test(matched.nameBn || "") ||
          /english|ইংরেজি/i.test(s.subjectName || "")
        )

        const targetSubjectName = isEng ? (matched.nameEn || matched.nameBn) : (matched.nameBn || matched.nameEn)
        const nameChanged = s.subjectName !== targetSubjectName

        let distsChanged = false
        const updatedDists = s.distributions.map((d) => {
          if (isEng) {
            const qType = filteredQuestionTypes.find((q) => q.id === d.questionTypeId) || questionTypes.find((q) => q.id === d.questionTypeId)
            const engName = qType?.nameEn || d.questionTypeName
            const isNameBn = /[\u0980-\u09FF]/.test(d.questionTypeName || "")
            const isLabelBn = /[\u0980-\u09FF]/.test(d.questionTypeLabel || "")
            if (isNameBn || (isLabelBn && engName)) {
              distsChanged = true
              return {
                ...d,
                questionTypeName: engName,
                questionTypeLabel: (!isLabelBn && d.questionTypeLabel) ? d.questionTypeLabel : engName,
              }
            }
          }
          return d
        })

        if (nameChanged || distsChanged) {
          changed = true
          return {
            ...s,
            subjectName: targetSubjectName,
            distributions: updatedDists,
          }
        }
        return s
      })

      if (changed) {
        onChange({ subjects: updated })
      }
    }
  }, [subjects, filteredQuestionTypes, questionTypes, data.subjects, onChange])

  // Auto-populate distributions from subject structure if subject has none
  const autoPopulatedSubjectsRef = useRef<Set<string>>(new Set())

  const buildStructureDistributions = (targetFilteredTypes: typeof filteredQuestionTypes): WizardDistribution[] => {
    return targetFilteredTypes.map((item) => {
      const sqt = item.preset
      const isEng = isExpandedSubjectEnglish
      const customLabel = sqt?.customLabel || item.label
      const isCustomEng = customLabel && !/[\u0980-\u09FF]/.test(customLabel)

      const resolvedName = isEng
        ? (item.nameEn || item.nameBn)
        : (item.nameBn || item.nameEn)

      const resolvedLabel = isEng
        ? (isCustomEng ? customLabel : (item.nameEn || item.nameBn))
        : (customLabel || item.nameBn || item.nameEn)

      let markDist = sqt?.markDistribution
      if (typeof markDist === "string") {
        try {
          markDist = JSON.parse(markDist)
        } catch {
          markDist = null
        }
      }
      const marksPerQ = sqt?.mark || item.mark || 1
      if (!markDist) markDist = { a: marksPerQ }

      const typePolicy = getQuestionTypePolicy(item.nameEn || item.nameBn || (item as any).code || customLabel)
      const isSingle = sqt?.selectionMode ? (sqt.selectionMode === "SINGLE_WITH_ALT" || sqt.selectionMode === "SINGLE_NO_ALT") : (typePolicy.selectionMode === "SINGLE" || sqt?.totalQuestions === 1)

      return {
        tempId: crypto.randomUUID(),
        questionTypeId: item.id,
        questionTypeName: resolvedName,
        questionTypeNameBn: item.nameBn || null,
        questionTypeLabel: resolvedLabel,
        marksPerQuestion: marksPerQ,
        markDistribution: markDist,
        renderMethod: sqt?.renderMethod ?? 1,
        questionCount: isSingle ? 1 : (sqt?.totalQuestions || 0),
        questionsToAttempt: isSingle ? 1 : (sqt?.requiredCount && sqt.requiredCount > 0 ? sqt.requiredCount : null),
        orderIndex: item.position,
      }
    })
  }

  useEffect(() => {
    if (!expandedSubjectId || !subjectDetail) return
    if (autoPopulatedSubjectsRef.current.has(expandedSubjectId)) return

    const currentSub = data.subjects.find((s) => s.tempId === expandedSubject)
    if (!currentSub || currentSub.distributions.length > 0) return

    if (filteredQuestionTypes.length > 0) {
      autoPopulatedSubjectsRef.current.add(expandedSubjectId)
      const defaultDists = buildStructureDistributions(filteredQuestionTypes)
      if (defaultDists.length > 0) {
        const updated = data.subjects.map((s) =>
          s.tempId === expandedSubject ? { ...s, distributions: defaultDists } : s
        )
        onChange({ subjects: updated })
      }
    }
  }, [expandedSubjectId, subjectDetail, filteredQuestionTypes, expandedSubject, data.subjects, isExpandedSubjectEnglish, onChange])

  const handleLoadStructureDistributions = (subjectTempId: string) => {
    if (filteredQuestionTypes.length === 0) {
      toast.info(
        isExpandedSubjectEnglish
          ? "No pre-configured question types found for this subject."
          : "এই বিষয়ের জন্য কোনো পূর্বনির্ধারিত প্রশ্নের কাঠামো পাওয়া যায়নি।"
      )
      return
    }

    const defaultDists = buildStructureDistributions(filteredQuestionTypes)
    const updated = data.subjects.map((s) =>
      s.tempId === subjectTempId ? { ...s, distributions: defaultDists } : s
    )
    onChange({ subjects: updated })
    toast.success(
      isExpandedSubjectEnglish
        ? "Distributions loaded from subject structure."
        : "বিষয় কাঠামো অনুযায়ী প্রশ্ন ও নম্বর বণ্টন লোড করা হয়েছে।"
    )
  }

  // Add subject manually
  const handleAddSubject = () => {
    if (!selectedSubjectId) return
    if (data.subjects.some((s) => s.subjectId === selectedSubjectId)) return

    const matched = subjects.find((s) => s.id === selectedSubjectId)
    if (!matched) return

    const isEng = Boolean(
      /english|ইংরেজি/i.test(matched.nameEn || "") ||
      /english|ইংরেজি/i.test(matched.nameBn || "")
    )

    const newSubject: WizardSubject = {
      tempId: crypto.randomUUID(),
      subjectId: matched.id,
      subjectName: isEng ? (matched.nameEn || matched.nameBn) : (matched.nameBn || matched.nameEn),
      distributions: [],
    }

    onChange({ subjects: [...data.subjects, newSubject] })
    setSelectedSubjectId("")
    setExpandedSubject(newSubject.tempId)
  }

  // Remove subject
  const handleRemoveSubject = (tempId: string) => {
    const remaining = data.subjects.filter((s) => s.tempId !== tempId)
    onChange({ subjects: remaining })
    if (expandedSubject === tempId) {
      setExpandedSubject(remaining.length > 0 ? remaining[0]!.tempId : null)
      resetDistForm()
    }
  }

  // Handle question type selection & autofill distribution inputs
  const handleQuestionTypeChange = (qTypeId: string) => {
    const matched = filteredQuestionTypes.find((t) => t.id === qTypeId)
    if (!matched) return

    // Find if there is a custom preset in subjectDetail.subjectQuestionTypes
    const preset = matched.preset || subjectDetail?.subjectQuestionTypes?.find(
      (sqt: any) => sqt.questionTypeId === qTypeId
    )

    const typePolicy = getQuestionTypePolicy(matched.nameEn || matched.nameBn || (matched as any).code || preset?.customLabel)
    const isSingle = preset?.selectionMode ? (preset.selectionMode === "SINGLE_WITH_ALT" || preset.selectionMode === "SINGLE_NO_ALT") : (typePolicy.selectionMode === "SINGLE" || preset?.totalQuestions === 1)

    setDistForm({
      questionTypeId: qTypeId,
      marksPerQuestion: preset ? String(preset.mark) : String(matched.mark || 1),
      questionCount: isSingle ? "1" : (preset ? String(preset.totalQuestions || 0) : ""),
      questionsToAttempt: isSingle ? "1" : (preset && preset.requiredCount > 0 ? String(preset.requiredCount) : ""),
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

    const matched = filteredQuestionTypes.find((t) => t.id === distForm.questionTypeId)
    if (!matched) return

    let finalQuestionCount = parseInt(distForm.questionCount, 10)
    const finalQuestionsToAttempt = distForm.questionsToAttempt ? parseInt(distForm.questionsToAttempt, 10) : null

    if (finalQuestionsToAttempt !== null && finalQuestionCount < finalQuestionsToAttempt) {
      finalQuestionCount = finalQuestionsToAttempt
      toast.info(
        isExpandedSubjectEnglish
          ? "Question count adjusted based on attempt count."
          : "চেষ্টার সংখ্যা অনুযায়ী মোট প্রশ্ন সংখ্যা সমন্বয় করা হয়েছে।"
      )
    }

    const marksNum = parseFloat(distForm.marksPerQuestion)

    // Check if preset exists in subjectDetail
    const preset = matched.preset || subjectDetail?.subjectQuestionTypes?.find(
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

    const customLabel = (preset as any)?.customLabel || (preset as any)?.questionTypeLabel
    const isCustomLabelEnglish = customLabel && !/[\u0980-\u09FF]/.test(customLabel)

    const englishLabel = isCustomLabelEnglish
      ? customLabel
      : (matched.nameEn || matched.nameBn)

    const bengaliLabel = customLabel && /[\u0980-\u09FF]/.test(customLabel)
      ? customLabel
      : (matched.nameBn || customLabel || matched.nameEn)

    const resolvedTypeName = isExpandedSubjectEnglish
      ? (matched.nameEn || matched.nameBn)
      : (matched.nameBn || matched.nameEn)

    const resolvedTypeLabel = isExpandedSubjectEnglish
      ? englishLabel
      : (bengaliLabel || englishLabel)

    const currentSub = data.subjects.find((s) => s.tempId === subjectTempId)
    const sDistLength = currentSub?.distributions.length || 0
    const orderIndex = typeof matched.position === "number"
      ? matched.position
      : (typeof preset?.position === "number" ? preset.position : sDistLength)

    const typePolicy = getQuestionTypePolicy(matched.nameEn || matched.nameBn || (matched as any).code || preset?.customLabel)
    const isSingle = typePolicy.selectionMode === "SINGLE" || preset?.totalQuestions === 1
    if (isSingle) {
      finalQuestionCount = 1
    }

    const distribution: WizardDistribution = {
      tempId: crypto.randomUUID(),
      questionTypeId: matched.id,
      questionTypeName: resolvedTypeName,
      questionTypeNameBn: matched.nameBn || null,
      questionTypeLabel: resolvedTypeLabel,
      marksPerQuestion: marksNum,
      markDistribution: markDist,
      renderMethod: preset?.renderMethod ?? 1,
      questionCount: isSingle ? 1 : finalQuestionCount,
      questionsToAttempt: isSingle ? 1 : finalQuestionsToAttempt,
      orderIndex,
    }

    const updatedSubjects = data.subjects.map((s) => {
      if (s.tempId !== subjectTempId) return s
      // Avoid duplicate distribution question types within the same subject
      const filteredDists = s.distributions.filter((d) => d.questionTypeId !== matched.id)
      const newDists = [...filteredDists, distribution].sort((a, b) => a.orderIndex - b.orderIndex)
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
                {availableSubjects.map((s) => {
                  const isEng = Boolean(
                    /english|ইংরেজি/i.test(s.nameEn || "") ||
                    /english|ইংরেজি/i.test(s.nameBn || "")
                  )
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {isEng ? (s.nameEn || s.nameBn) : (s.nameBn || s.nameEn)}
                    </SelectItem>
                  )
                })}
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

                      {/* Empty distributions prompt with quick-load */}
                      {subject.distributions.length === 0 && filteredQuestionTypes.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/40 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs font-body">
                          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
                            <span>
                              {isExpandedSubjectEnglish
                                ? "This subject has a pre-configured question structure. Would you like to load it?"
                                : "এই বিষয়ের জন্য পূর্বনির্ধারিত কাঠামো রয়েছে। আপনি কি তা লোড করতে চান?"}
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleLoadStructureDistributions(subject.tempId)}
                            className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs font-headline"
                          >
                            {isExpandedSubjectEnglish ? "Load Structure" : "কাঠামো অনুযায়ী লোড করুন"}
                          </Button>
                        </div>
                      )}

                      {/* Distributions list - Responsive Card list on mobile & Table on sm+ */}
                      {(() => {
                        const matchedSub = subjects.find((s) => s.id === subject.subjectId)
                        const isSubEnglish = isResourceEnglish({
                          subjectName: subject.subjectName,
                          subjectNameEn: matchedSub?.nameEn,
                          subjectNameBn: matchedSub?.nameBn,
                        })

                        return subject.distributions.length > 0 && (
                          <div>
                            {/* Mobile Cards (sm:hidden) */}
                            <div className="space-y-2 sm:hidden">
                              {subject.distributions.map((dist) => {
                                const displayTypeName = isSubEnglish
                                  ? (dist.questionTypeLabel || dist.questionTypeName || dist.questionTypeNameBn)
                                  : (dist.questionTypeNameBn || dist.questionTypeName || dist.questionTypeLabel)

                                return (
                                  <div
                                    key={dist.tempId}
                                    className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card shadow-2xs space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className="text-xs font-bold text-foreground font-headline">
                                          {displayTypeName}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                          {isSubEnglish ? (
                                            <>Marks per question: <span className="font-semibold text-foreground">{dist.marksPerQuestion}</span></>
                                          ) : (
                                            <>প্রতি প্রশ্নে: <span className="font-semibold text-foreground font-solaiman">{dist.marksPerQuestion}</span> নম্বর</>
                                          )}
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
                                        <span>{isSubEnglish ? "Count: " : "সংখ্যা: "}<strong className={`text-foreground ${isSubEnglish ? "" : "font-solaiman"}`}>{dist.questionCount}</strong></span>
                                        <span>{isSubEnglish ? "Attempt: " : "চেষ্টা: "}<strong className={`text-foreground ${isSubEnglish ? "" : "font-solaiman"}`}>{dist.questionsToAttempt ?? (isSubEnglish ? "All" : "সব")}</strong></span>
                                      </div>
                                      <span className={`font-bold text-xs text-indigo-600 dark:text-indigo-400 ${isSubEnglish ? "" : "font-solaiman"}`}>
                                        {isSubEnglish ? `Total: ${dist.marksPerQuestion * (dist.questionsToAttempt ?? dist.questionCount)}` : `মোট: ${dist.marksPerQuestion * (dist.questionsToAttempt ?? dist.questionCount)}`}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Desktop Table (hidden sm:block) */}
                            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-card">
                              <table className="w-full text-xs font-body">
                                <thead>
                                  <tr className="border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] text-muted-foreground">
                                    <th className="text-left py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">{isSubEnglish ? "Type" : "ধরণ"}</th>
                                    <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">{isSubEnglish ? "Marks/Q" : "নম্বর/প্রশ্ন"}</th>
                                    <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">{isSubEnglish ? "Count" : "প্রশ্ন সংখ্যা"}</th>
                                    <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">{isSubEnglish ? "Attempt" : "চেষ্টা"}</th>
                                    <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider">{isSubEnglish ? "Total" : "মোট"}</th>
                                    <th className="text-center py-2.5 px-3 text-[11px] font-bold font-headline uppercase tracking-wider w-10"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                                  {subject.distributions.map((dist) => {
                                    const displayTypeName = isSubEnglish
                                      ? (dist.questionTypeLabel || dist.questionTypeName || dist.questionTypeNameBn)
                                      : (dist.questionTypeNameBn || dist.questionTypeName || dist.questionTypeLabel)

                                    return (
                                      <tr key={dist.tempId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2.5 px-3 font-semibold text-foreground">{displayTypeName}</td>
                                        <td className={`py-2.5 px-3 text-center text-muted-foreground ${isSubEnglish ? "" : "font-solaiman"}`}>{dist.marksPerQuestion}</td>
                                        <td className={`py-2.5 px-3 text-center text-muted-foreground ${isSubEnglish ? "" : "font-solaiman"}`}>{dist.questionCount}</td>
                                        <td className={`py-2.5 px-3 text-center text-muted-foreground ${isSubEnglish ? "" : "font-solaiman"}`}>
                                          {dist.questionsToAttempt ?? (isSubEnglish ? "All" : "সব")}
                                        </td>
                                        <td className={`py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400 ${isSubEnglish ? "" : "font-solaiman"}`}>
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
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Add distribution form */}
                      <div className="rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/50 p-3.5 sm:p-4 space-y-3 bg-indigo-50/30 dark:bg-indigo-950/10">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-headline">
                            {isExpandedSubjectEnglish ? "Add New Question Type & Marks Distribution" : "নতুন প্রশ্নের ধরণ ও নম্বর বণ্টন যোগ করুন"}
                          </p>
                          {(isDetailLoading || isTypesLoading) && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 shrink-0" />
                          )}
                        </div>

                        {!isDetailLoading && !isTypesLoading && filteredQuestionTypes.length === 0 && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs font-body">
                            <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>
                              {isExpandedSubjectEnglish
                                ? "No question types configured for this subject yet."
                                : "এই বিষয়ের জন্য কোনো প্রশ্নের ধরণ কনফিগার করা হয়নি।"}
                            </span>
                          </div>
                        )}

                        {showAutoFillToast && (
                          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-body animate-in fade-in duration-300">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {isExpandedSubjectEnglish
                                ? "Marks and question count autofilled!"
                                : "নম্বর ও প্রশ্ন সংখ্যা স্বয়ংক্রিয়ভাবে পূরণ হয়েছে!"}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="sm:col-span-1">
                            <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">
                              {isExpandedSubjectEnglish ? "Question Type *" : "প্রশ্নের ধরণ *"}
                            </label>
                            <Select value={distForm.questionTypeId} onValueChange={handleQuestionTypeChange}>
                              <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-card py-2 px-3 font-body text-xs h-10 justify-between">
                                <SelectValue placeholder={isExpandedSubjectEnglish ? "Select Type" : "ধরণ নির্বাচন করুন"} />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-xl font-body">
                                {(isDetailLoading || isTypesLoading) && filteredQuestionTypes.length === 0 ? (
                                  <div className="flex items-center justify-center p-3 text-xs text-muted-foreground gap-2 font-body">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                                    <span>{isExpandedSubjectEnglish ? "Loading question types..." : "প্রশ্নের ধরণ লোড হচ্ছে..."}</span>
                                  </div>
                                ) : filteredQuestionTypes.length === 0 ? (
                                  <div className="px-3 py-2 text-xs text-muted-foreground font-body">
                                    {isExpandedSubjectEnglish ? "No question types configured" : "কোনো প্রশ্নের ধরণ পাওয়া যায়নি"}
                                  </div>
                                ) : (
                                  filteredQuestionTypes.map((t) => {
                                    const preset = t.preset || subjectDetail?.subjectQuestionTypes?.find(
                                      (sqt: any) => sqt.questionTypeId === t.id
                                    )
                                    const isCustomEnglish = preset?.customLabel && !/[\u0980-\u09FF]/.test(preset.customLabel)
                                    const englishName = t.nameEn || ""
                                    const bengaliName = t.nameBn || ""

                                    const displayLabel = isExpandedSubjectEnglish
                                      ? (englishName || (isCustomEnglish ? preset.customLabel : "") || t.label || bengaliName)
                                      : (preset?.customLabel || bengaliName || englishName)

                                    return (
                                      <SelectItem key={t.id} value={t.id}>
                                        {displayLabel}
                                      </SelectItem>
                                    )
                                  })
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:contents">
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">
                                {isExpandedSubjectEnglish ? "Marks/Question *" : "নম্বর/প্রশ্ন *"}
                              </label>
                              <Input
                                type="number"
                                value={distForm.marksPerQuestion}
                                onChange={(e) => setDistForm((p) => ({ ...p, marksPerQuestion: e.target.value }))}
                                placeholder={isExpandedSubjectEnglish ? "1" : "১"}
                                min={0.5}
                                step={0.5}
                                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">
                                {isExpandedSubjectEnglish ? "Question Count *" : "প্রশ্ন সংখ্যা *"}
                              </label>
                              {(() => {
                                const selectedTypeObj = filteredQuestionTypes.find((t) => t.id === distForm.questionTypeId)
                                const isCurrentSingle = isSingleQuestionType(selectedTypeObj?.nameEn || selectedTypeObj?.nameBn || (selectedTypeObj as any)?.code)
                                return (
                                  <Input
                                    type="number"
                                    disabled={isCurrentSingle}
                                    value={isCurrentSingle ? "1" : distForm.questionCount}
                                    onChange={(e) => setDistForm((p) => ({ ...p, questionCount: e.target.value }))}
                                    onBlur={handleQuestionCountBlur}
                                    placeholder={isExpandedSubjectEnglish ? "10" : "১০"}
                                    min={0}
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 disabled:opacity-80 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                  />
                                )
                              })()}
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-muted-foreground font-body mb-1 block">
                                {isExpandedSubjectEnglish ? "To Attempt (Optional)" : "চেষ্টা (ঐচ্ছিক)"}
                              </label>
                              {(() => {
                                const selectedTypeObj = filteredQuestionTypes.find((t) => t.id === distForm.questionTypeId)
                                const isCurrentSingle = isSingleQuestionType(selectedTypeObj?.nameEn || selectedTypeObj?.nameBn || (selectedTypeObj as any)?.code) || selectedTypeObj?.preset?.totalQuestions === 1
                                return (
                                  <Input
                                    type="number"
                                    disabled={isCurrentSingle}
                                    value={isCurrentSingle ? "1" : distForm.questionsToAttempt}
                                    onChange={(e) => setDistForm((p) => ({ ...p, questionsToAttempt: e.target.value }))}
                                    onBlur={handleQuestionsToAttemptBlur}
                                    placeholder={isCurrentSingle ? "1" : (isExpandedSubjectEnglish ? "All" : "সব")}
                                    min={1}
                                    className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] py-2 px-3 font-body text-xs text-foreground bg-card focus:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 disabled:opacity-80 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                  />
                                )
                              })()}
                            </div>
                          </div>
                        </div>

                        {distForm.questionsToAttempt !== "" && (parseInt(distForm.questionCount, 10) || 0) < (parseInt(distForm.questionsToAttempt, 10) || 0) && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-body font-medium animate-in fade-in duration-200">
                            {isExpandedSubjectEnglish
                              ? "⚠️ Questions to attempt cannot exceed total question count."
                              : "⚠️ চেষ্টার সংখ্যা মোট প্রশ্ন সংখ্যার চেয়ে বেশি হতে পারবে না।"}
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
                              <span>{isExpandedSubjectEnglish ? "Add Distribution" : "নম্বর বণ্টন যোগ করুন"}</span>
                            </Button>
                          )
                        })()}
                      </div>

                      {/* Subject actions */}
                      <div className="flex items-center justify-between pt-1">
                        {filteredQuestionTypes.length > 0 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleLoadStructureDistributions(subject.tempId)}
                            className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl px-3 py-1.5 cursor-pointer h-auto font-headline font-semibold"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{isExpandedSubjectEnglish ? "Reload Subject Structure" : "কাঠামো অনুযায়ী বণ্টন রিলোড"}</span>
                          </Button>
                        ) : <div />}
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleRemoveSubject(subject.tempId)}
                          className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs rounded-xl px-3 py-1.5 cursor-pointer h-auto font-headline font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{isExpandedSubjectEnglish ? "Delete Subject" : "বিষয় ডিলিট করুন"}</span>
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
