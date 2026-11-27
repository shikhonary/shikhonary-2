"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@workspace/ui/components/sonner"
import { useTemplatesList, useCreateFromTemplate } from "../services/use-question-paper"
import { useTemplatePickerModalStore } from "../store/use-template-picker-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Bookmark,
  Loader2,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Search,
  ArrowRight,
  Layers,
  Info,
} from "lucide-react"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

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

export function TemplatePickerModal() {
  const router = useRouter()
  const { isOpen, closeModal } = useTemplatePickerModalStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string>("All")
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [chosenSubjectId, setChosenSubjectId] = useState<string>("")
  const [instantiatingId, setInstantiatingId] = useState<string | null>(null)

  const { data: templatesData, isLoading } = useTemplatesList({
    classId: selectedClassId === "All" ? undefined : selectedClassId,
    search: searchQuery.trim() || undefined,
  })
  const templates = templatesData?.templates || []

  // Classes for filtering
  const { data: classesData } = useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const classes = (classesData?.academicClasses ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  // Subjects for the chosen template class (if generic)
  const targetClassId = selectedTemplate?.classId
  const { data: subjectsData, isLoading: isSubjectsLoading } = useQuery({
    ...trpc.academicSubject.list.queryOptions({ limit: 100, classId: targetClassId || undefined }),
    enabled: Boolean(targetClassId),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const availableSubjects = (subjectsData?.academicSubjects ?? []) as Array<{ id: string; nameBn: string; nameEn: string }>

  const createFromTemplateMutation = useCreateFromTemplate()

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

  const handleSelectTemplate = (template: any) => {
    if (isTemplateGeneric(template)) {
      setSelectedTemplate(template)
      setChosenSubjectId("")
    } else {
      executeInstantiation(template.id)
    }
  }

  const executeInstantiation = async (templateId: string, subjectId?: string, subjectName?: string) => {
    setInstantiatingId(templateId)
    try {
      const newPaper = await createFromTemplateMutation.mutateAsync({
        templateId,
        targetSubjectId: subjectId || undefined,
        targetSubjectName: subjectName || undefined,
      })

      toast.success("টেমপ্লেট থেকে সফলভাবে নতুন প্রশ্নপত্র তৈরি হয়েছে!")
      closeModal()
      setSelectedTemplate(null)
      router.push(`/question-papers/${newPaper.id}/builder`)
    } catch (err: any) {
      toast.error(err?.message || "টেমপ্লেট থেকে প্রশ্নপত্র তৈরি করা যায়নি")
    } finally {
      setInstantiatingId(null)
    }
  }

  const handleConfirmGenericSubject = () => {
    if (!selectedTemplate) return
    if (!chosenSubjectId) {
      toast.error("অনুগ্রহ করে একটি বিষয় নির্বাচন করুন")
      return
    }
    const subj = availableSubjects.find((s) => s.id === chosenSubjectId)
    executeInstantiation(selectedTemplate.id, chosenSubjectId, subj?.nameBn || subj?.nameEn)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeModal()
          setSelectedTemplate(null)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        style={{
          minWidth: "320px",
          maxWidth: selectedTemplate ? "480px" : "680px",
          width: "calc(100vw - 2rem)",
        }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display transition-all duration-200"
      >
        {selectedTemplate ? (
          /* ── Step 2: Generic Subject Selection (Matches Duplicate Modal Style 100%) ── */
          <div className="space-y-4">
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
                  &quot;{selectedTemplate.title}&quot;
                </span>{" "}
                সাধারণ ব্লুপ্রিন্টটি ব্যবহার করতে যাচ্ছেন। পরীক্ষার বিষয়টি সিলেক্ট করুন:
              </DialogDescription>
            </DialogHeader>

            {/* Subject Selection (Select Dropdown Only) */}
            <div className="space-y-1.5 font-body">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>বিষয় ({selectedTemplate.className})</span>
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

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
              >
                ফিরে যান
              </Button>
              <Button
                type="button"
                disabled={!chosenSubjectId || createFromTemplateMutation.isPending}
                onClick={handleConfirmGenericSubject}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs"
              >
                {createFromTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>প্রশ্নপত্র তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>প্রশ্নপত্র শুরু করুন</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Step 1: Browse Templates Gallery ── */
          <div className="space-y-4">
            {/* Header Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>সংরক্ষিত ব্লুপ্রিন্ট টেমপ্লেট</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-headline">
                    {toBengaliNumber(templates.length)}টি টেমপ্লেট
                  </span>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 font-body">
                  পূর্বের সংরক্ষিত কাঠামো নির্বাচন করে মুহূর্তে নতুন প্রশ্নপত্র তৈরি করুন
                </p>
              </div>
            </div>

            {/* Search and Class Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="টেমপ্লেটের নাম দিয়ে খুঁজুন..."
                  className="pl-10 h-10 text-xs sm:text-sm rounded-xl bg-background border-border font-body"
                />
              </div>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl bg-background border-border text-xs sm:text-sm font-headline">
                  <SelectValue placeholder="সকল শ্রেণি" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-headline">
                  <SelectItem value="All">সকল শ্রেণি</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nameBn || c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates List */}
            <div className="space-y-3 pt-1 max-h-[55vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="font-headline">টেমপ্লেট তালিকা লোড হচ্ছে...</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 space-y-2">
                  <Bookmark className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                  <p className="text-xs font-bold font-headline text-foreground">
                    কোনো সংরক্ষিত ব্লুপ্রিন্ট টেমপ্লেট পাওয়া যায়নি
                  </p>
                  <p className="text-[11px] text-muted-foreground font-body max-w-sm mx-auto leading-relaxed">
                    যেকোনো প্রশ্নপত্র তৈরি করার পর তার ৩-ডট মেনু বা বিল্ডারের সেটিংস থেকে &quot;টেমপ্লেট হিসেবে সংরক্ষণ&quot; ক্লিক করলেই তা এখানে চলে আসবে।
                  </p>
                </div>
              ) : (
                templates.map((template: any) => {
                  const isGeneric = isTemplateGeneric(template)
                  const subjectTitle = isGeneric
                    ? "সাধারণ ফরম্যাট (যেকোনো বিষয়)"
                    : template.subjects?.map((s: any) => s.subjectName).filter(Boolean).join(", ") || "নির্দিষ্ট বিষয়"

                  const totalDistCount = template.subjects?.reduce(
                    (acc: number, s: any) => acc + (s.distributions?.length || 0),
                    0
                  )

                  return (
                    <div
                      key={template.id}
                      className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className="rounded-lg px-2 py-0.5 border border-primary/20 bg-primary/5 text-primary text-xs font-semibold font-headline"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            {template.className}
                          </Badge>

                          {isGeneric ? (
                            <Badge
                              variant="outline"
                              className="rounded-lg px-2 py-0.5 text-xs font-semibold font-headline border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>যেকোনো বিষয়</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="rounded-lg px-2 py-0.5 text-xs font-medium font-body border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-muted-foreground"
                            >
                              {subjectTitle}
                            </Badge>
                          )}
                        </div>

                        <h4
                          className="font-headline font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors"
                          title={template.title}
                        >
                          {template.title}
                        </h4>

                        {template.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 font-body">
                            {template.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-body flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>পূর্ণমান: {toBengaliNumber(template.total || 0)}</span>
                          </span>
                          {template.timeInMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-sky-500" />
                              <span>{formatDurationBn(template.timeInMinutes)}</span>
                            </span>
                          )}
                          {totalDistCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-primary" />
                              <span>{toBengaliNumber(totalDistCount)}টি বণ্টন কাঠামো</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleSelectTemplate(template)}
                        disabled={instantiatingId === template.id}
                        className="h-9.5 px-4 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold font-headline text-xs gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        {instantiatingId === template.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>ব্যবহার করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-border/50 font-headline">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  closeModal()
                  setSelectedTemplate(null)
                }}
                className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 cursor-pointer h-10"
              >
                বন্ধ করুন
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
