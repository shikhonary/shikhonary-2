"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@workspace/ui/components/sonner"
import { useTemplatesList, useCreateFromTemplate } from "../services/use-question-paper"
import { useDeleteQuestionPaperModalStore } from "../store/use-delete-question-paper-modal-store"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import {
  Search,
  Bookmark,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  ArrowRight,
  MoreVertical,
  Trash,
  Plus,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

const toBengaliNumber = (num: number | string) => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
  return String(num)
    .split("")
    .map((d) => bnDigits[parseInt(d, 10)] || d)
    .join("")
}

function formatDurationBn(minutes: number): string {
  if (!minutes) return "০ মিনিট"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${toBengaliNumber(hours)} ঘণ্টা ${toBengaliNumber(mins)} মিনিট`
  } else if (hours > 0) {
    return `${toBengaliNumber(hours)} ঘণ্টা`
  } else {
    return `${toBengaliNumber(mins)} মিনিট`
  }
}

export function QuestionPaperTemplatesTab() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string>("All")
  const [selectedTemplateForGeneric, setSelectedTemplateForGeneric] = useState<any | null>(null)
  const [chosenSubjectId, setChosenSubjectId] = useState<string>("")
  const [instantiatingId, setInstantiatingId] = useState<string | null>(null)

  const openDeleteModal = useDeleteQuestionPaperModalStore((state) => state.openModal)

  // Fetch templates list
  const { data: templatesData, isLoading } = useTemplatesList({
    classId: selectedClassId === "All" ? undefined : selectedClassId,
    search: searchQuery.trim() || undefined,
  })
  const templates = templatesData?.templates || []

  // Classes for filter dropdown
  const { data: classesData } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = (classesData?.academicClasses ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  // Subjects for the generic template modal
  const targetClassId = selectedTemplateForGeneric?.classId
  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    ...trpc.academicSubject.list.queryOptions({ limit: 100, classId: targetClassId || undefined }),
    enabled: Boolean(targetClassId),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const availableSubjects = (subjectsData?.academicSubjects ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const createMutation = useCreateFromTemplate()

  const isTemplateGeneric = (template: any) => {
    return Boolean(
      template.subjects?.some(
        (s: any) =>
          s.subjectId === "generic" ||
          s.subjectName === "সাধারণ / বিষয় ছাড়া" ||
          s.subjectName?.toLowerCase().includes("generic") ||
          s.subjectName?.includes("সাধারণ")
      ) ||
      template.subjects?.length === 0 ||
      !template.subjects?.[0]?.subjectId
    )
  }

  const handleUseTemplate = (template: any) => {
    if (isTemplateGeneric(template)) {
      setSelectedTemplateForGeneric(template)
      setChosenSubjectId("")
    } else {
      executeInstantiation(template.id)
    }
  }

  const executeInstantiation = async (templateId: string, subjectId?: string, subjectName?: string) => {
    setInstantiatingId(templateId)
    try {
      const newPaper = await createMutation.mutateAsync({
        templateId,
        targetSubjectId: subjectId || undefined,
        targetSubjectName: subjectName || undefined,
      })
      toast.success("টেমপ্লেট থেকে সফলভাবে প্রশ্নপত্র তৈরি হয়েছে!")
      setSelectedTemplateForGeneric(null)
      router.push(`/question-papers/${newPaper.id}/builder`)
    } catch (err: any) {
      toast.error(err?.message || "টেমপ্লেট থেকে প্রশ্নপত্র তৈরি করা যায়নি")
    } finally {
      setInstantiatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="টেমপ্লেটের নাম দিয়ে খুঁজুন..."
              className="pl-10 h-10 rounded-xl bg-card border-slate-200 dark:border-white/10 text-xs sm:text-sm font-body"
            />
          </div>

          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-card border-slate-200 dark:border-white/10 text-xs sm:text-sm font-headline">
              <SelectValue placeholder="সব শ্রেণি" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="All">সব শ্রেণি</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.nameBn || cls.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground font-body self-end sm:self-center">
          মোট টেমপ্লেট: <span className="font-bold font-headline text-foreground">{toBengaliNumber(templates.length)}</span>টি
        </div>
      </div>

      {/* Templates Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-6 space-y-4 animate-pulse select-none"
            >
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/[0.06] rounded" />
              <div className="h-10 w-full bg-slate-100 dark:bg-white/[0.06] rounded-xl" />
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-12 text-center space-y-4">
          <div className="size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-800/40 shadow-xs">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-headline font-bold text-base sm:text-lg text-foreground">
              কোনো সংরক্ষিত ব্লুপ্রিন্ট টেমপ্লেট নেই
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              যেকোনো প্রশ্নপত্র তৈরি বা এডিট করার সময় 'টেমপ্লেট হিসেবে সংরক্ষণ' করে রাখলে পরবর্তীতে মাত্র ১-ক্লিকে একই লেআউট ও মানবন্টনে নতুন প্রশ্নপত্র শুরু করতে পারবেন।
            </p>
          </div>
          <Button asChild className="rounded-xl bg-primary text-primary-foreground font-bold h-10 px-5 gap-2 shadow-xs font-headline">
            <Link href="/question-papers/create">
              <Plus className="w-4 h-4" />
              <span>নতুন প্রশ্নপত্র তৈরি করুন</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl: any) => {
            const isGeneric = isTemplateGeneric(tpl)
            const subjectLabel = isGeneric
              ? "সাধারণ / যে কোনো বিষয়"
              : tpl.subjects?.map((s: any) => s.subjectName).filter(Boolean).join(", ") || "নির্দিষ্ট বিষয়"
            const totalMarks = tpl.total || 0
            const timeInMinutes = tpl.timeInMinutes || 0
            const sectionCount = tpl.sections?.length || 0

            return (
              <div
                key={tpl.id}
                className="group relative rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all p-5 shadow-xs hover:shadow-md flex flex-col justify-between gap-4"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
                        <Bookmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-headline font-bold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {tpl.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-body line-clamp-1 mt-0.5">
                          {tpl.examName || "পরীক্ষার ব্লুপ্রিন্ট"}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl font-headline">
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => openDeleteModal(tpl.id, tpl.title)}
                          className="cursor-pointer gap-2.5 text-xs font-medium text-red-600 dark:text-red-400"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span>টেমপ্লেট মুছুন</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge
                      variant="outline"
                      className="rounded-lg px-2 py-0.5 border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-headline"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      {tpl.className}
                    </Badge>

                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-xs font-medium font-headline",
                        isGeneric
                          ? "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-muted-foreground"
                      )}
                    >
                      {isGeneric && <Sparkles className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />}
                      {subjectLabel}
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body pt-1">
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>পূর্ণমান: {toBengaliNumber(totalMarks)}</span>
                    </div>
                    {timeInMinutes > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span>{formatDurationBn(timeInMinutes)}</span>
                      </div>
                    )}
                    {sectionCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{toBengaliNumber(sectionCount)}টি সেকশন</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Button */}
                <Button
                  type="button"
                  onClick={() => handleUseTemplate(tpl)}
                  disabled={instantiatingId === tpl.id}
                  className="w-full h-9.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-headline font-bold text-xs cursor-pointer gap-2 shadow-xs transition-all active:scale-98"
                >
                  {instantiatingId === tpl.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>এই টেমপ্লেট দিয়ে প্রশ্নপত্র তৈরি করুন</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Generic Template Subject Selection Modal */}
      {selectedTemplateForGeneric && (
        <Dialog
          open={Boolean(selectedTemplateForGeneric)}
          onOpenChange={(open) => !open && setSelectedTemplateForGeneric(null)}
        >
          <DialogContent
            showCloseButton={false}
            style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
            className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
                  বিষয় নির্বাচন করুন
                </DialogTitle>
                <p className="text-xs text-outline mt-0.5">
                  পরীক্ষার বিষয়টি নির্ধারণ করুন
                </p>
              </div>
            </div>

            <DialogHeader className="pt-1 font-body text-left">
              <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
                আপনি{" "}
                <span className="font-bold text-on-surface">
                  &quot;{selectedTemplateForGeneric.title}&quot;
                </span>{" "}
                সাধারণ ব্লুপ্রিন্টটি ব্যবহার করতে যাচ্ছেন। পরীক্ষার বিষয়টি সিলেক্ট করুন:
              </DialogDescription>
            </DialogHeader>

            {/* Subject Selection (Select Dropdown Only) */}
            <div className="space-y-1.5 font-body">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>বিষয় ({selectedTemplateForGeneric.className})</span>
                <span className="text-[11px] text-outline font-normal">*বাধ্যতামূলক</span>
              </label>

              {isSubjectsLoading ? (
                <div className="h-10 rounded-xl bg-surface-container-high/60 animate-pulse flex items-center px-3 text-xs text-outline">
                  বিষয় তালিকা লোড হচ্ছে...
                </div>
              ) : availableSubjects.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-outline-variant/60 bg-surface-container-low text-center text-xs text-outline">
                  এই শ্রেণির অধীনে কোনো বিষয় পাওয়া যায়নি।
                </div>
              ) : (
                <Select value={chosenSubjectId} onValueChange={setChosenSubjectId}>
                  <SelectTrigger className="w-full h-10 rounded-xl bg-white border border-outline-variant/60 text-xs sm:text-sm text-on-surface">
                    <SelectValue placeholder="বিষয় সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-body">
                    {availableSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="cursor-pointer">
                        {s.nameBn || s.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Info Notice Box */}
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-body">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                বিষয় নির্ধারণের পর সম্পূর্ণ প্রশ্নহীন লেআউট ও মানবন্টন প্রস্তুত হয়ে যাবে এবং আপনি সরাসরি এআই বিল্ডারে প্রশ্ন পিক করতে পারবেন।
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTemplateForGeneric(null)}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={!chosenSubjectId || createMutation.isPending}
                onClick={() => {
                  const sub = availableSubjects.find((s) => s.id === chosenSubjectId)
                  executeInstantiation(
                    selectedTemplateForGeneric.id,
                    chosenSubjectId,
                    sub?.nameBn || sub?.nameEn
                  )
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>প্রশ্নপত্র শুরু করুন</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
