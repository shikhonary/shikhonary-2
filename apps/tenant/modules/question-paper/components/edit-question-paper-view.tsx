"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useQuestionPaperById,
  useUpdateQuestionPaper,
  useAddQuestion,
  useRemoveQuestion,
  useUpsertSection,
  useDeleteSection,
  useUpsertSubject,
  useDeleteSubject,
  useUpsertDistribution,
  useDeleteDistribution,
} from "../services/use-question-paper"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { trpc } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { Plus, Trash, Eye, Printer, ArrowLeft, Loader2, Save, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Info } from "lucide-react"

// Form schemas for sub-items
const sectionSchema = z.object({
  title: z.string().min(1, "শিরোনাম আবশ্যক"),
  titleBn: z.string().optional(),
  instructions: z.string().optional(),
})

const subjectSchema = z.object({
  subjectId: z.string().min(1, "বিষয় নির্বাচন আবশ্যক"),
})

const distSchema = z.object({
  questionTypeId: z.string().min(1, "প্রশ্ন ধরণ নির্বাচন আবশ্যক"),
  marksPerQuestion: z.coerce.number().positive("নম্বর অবশ্যই ধনাত্মক হতে হবে"),
  questionCount: z.coerce.number().int().nonnegative("সংখ্যা অবশ্যই ০ বা তার বেশি হতে হবে"),
  questionsToAttempt: z.coerce.number().int().positive().optional().nullable(),
})

interface EditQuestionPaperViewProps {
  id: string
}

export function EditQuestionPaperView({ id }: EditQuestionPaperViewProps) {
  // Queries
  const { data: paper, isLoading: isPaperLoading, isError: isPaperError } = useQuestionPaperById(id)
  
  // Fetch global classes/subjects/question types
  const { data: subjectsData } = useQuery({
    ...trpc.academicSubject.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const globalSubjects = subjectsData?.academicSubjects ?? []

  const { data: typesData } = useQuery({
    ...trpc.questionType.list.queryOptions({ limit: 100 }),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const questionTypes = typesData?.questionTypes ?? []

  // Mutations
  const updatePaperMutation = useUpdateQuestionPaper()
  const addQuestionMutation = useAddQuestion()
  const removeQuestionMutation = useRemoveQuestion()
  const upsertSectionMutation = useUpsertSection()
  const deleteSectionMutation = useDeleteSection()
  const upsertSubjectMutation = useUpsertSubject()
  const deleteSubjectMutation = useDeleteSubject()
  const upsertDistMutation = useUpsertDistribution()
  const deleteDistMutation = useDeleteDistribution()

  // State
  const [activeTab, setActiveTab] = useState<"MCQ" | "CQ" | "SHORT">("MCQ")
  const [questionSearch, setQuestionSearch] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedDistId, setSelectedDistId] = useState("")

  // Form setups
  const sectionForm = useForm<z.infer<typeof sectionSchema>>({ resolver: zodResolver(sectionSchema) })
  const subjectForm = useForm<z.infer<typeof subjectSchema>>({ resolver: zodResolver(subjectSchema) })
  const distForm = useForm<z.infer<typeof distSchema>>({ resolver: zodResolver(distSchema) })

  // Question lists based on selected type
  const { data: mcqData, isLoading: isMcqLoading } = useQuery({
    ...trpc.mcq.list.queryOptions({
      limit: 50,
      subjectId: selectedSubjectId || undefined,
      query: questionSearch || undefined,
    }),
    enabled: activeTab === "MCQ",
  })

  const { data: cqData, isLoading: isCqLoading } = useQuery({
    ...trpc.cq.list.queryOptions({
      limit: 50,
      subjectId: selectedSubjectId || undefined,
      query: questionSearch || undefined,
    }),
    enabled: activeTab === "CQ",
  })

  const { data: shortData, isLoading: isShortLoading } = useQuery({
    ...trpc.shortAnswer.list.queryOptions({
      limit: 50,
      subjectId: selectedSubjectId || undefined,
      query: questionSearch || undefined,
    }),
    enabled: activeTab === "SHORT",
  })

  if (isPaperLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center font-display">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" /> লোড হচ্ছে...
      </div>
    )
  }

  if (isPaperError || !paper) {
    return (
      <div className="p-8 text-center text-red-500 font-display">
        <p className="font-bold">প্রশ্নপত্র তথ্য লোড করতে ব্যর্থ হয়েছে।</p>
      </div>
    )
  }

  // Publish / Save
  const handlePublishToggle = async () => {
    const nextStatus = paper.status === "Published" ? "Draft" : "Published"
    try {
      await updatePaperMutation.mutateAsync({
        id: paper.id,
        status: nextStatus,
      })
      toast.success(nextStatus === "Published" ? "প্রশ্নপত্র সফলভাবে প্রকাশিত হয়েছে।" : "প্রশ্নপত্র ড্রাফট মুডে ফিরিয়ে নেওয়া হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে")
    }
  }

  // Sections
  const handleAddSection = async (data: z.infer<typeof sectionSchema>) => {
    try {
      await upsertSectionMutation.mutateAsync({
        questionPaperId: paper.id,
        title: data.title,
        titleBn: data.titleBn || null,
        instructions: data.instructions || null,
      })
      toast.success("সেকশন সফলভাবে যোগ হয়েছে।")
      sectionForm.reset()
    } catch (err: any) {
      toast.error(err.message || "সেকশন যোগ করতে ব্যর্থ হয়েছে")
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSectionMutation.mutateAsync({ questionPaperId: paper.id, id: sectionId })
      toast.success("সেকশন সফলভাবে মুছে ফেলা হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "সেকশন মুছতে ব্যর্থ হয়েছে")
    }
  }

  // Subjects
  const handleAddSubject = async (data: z.infer<typeof subjectSchema>) => {
    const matched = globalSubjects.find((s: any) => s.id === data.subjectId)
    if (!matched) return

    try {
      await upsertSubjectMutation.mutateAsync({
        questionPaperId: paper.id,
        subjectId: matched.id,
        subjectName: matched.nameBn || matched.nameEn,
      })
      toast.success("বিষয় সফলভাবে সংযুক্ত করা হয়েছে।")
      subjectForm.reset()
    } catch (err: any) {
      toast.error(err.message || "বিষয় সংযুক্ত করতে ব্যর্থ হয়েছে")
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubjectMutation.mutateAsync({ questionPaperId: paper.id, id: subjectId })
      toast.success("বিষয় মুছে ফেলা হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "বিষয় মুছতে ব্যর্থ হয়েছে")
    }
  }

  // Distributions
  const handleAddDist = async (data: z.infer<typeof distSchema>, paperSubjectId: string) => {
    const matched = questionTypes.find((t: any) => t.id === data.questionTypeId)
    if (!matched) return

    try {
      await upsertDistMutation.mutateAsync({
        paperSubjectId,
        questionTypeId: matched.id,
        questionTypeName: matched.nameBn || matched.nameEn,
        marksPerQuestion: data.marksPerQuestion,
        questionCount: data.questionCount,
        questionsToAttempt: data.questionsToAttempt || null,
      })
      toast.success("নম্বর বণ্টন সফলভাবে যোগ করা হয়েছে।")
      distForm.reset()
    } catch (err: any) {
      toast.error(err.message || "নম্বর বণ্টন তৈরি ব্যর্থ হয়েছে")
    }
  }

  const handleDeleteDist = async (distId: string) => {
    try {
      await deleteDistMutation.mutateAsync({ questionPaperId: paper.id, id: distId })
      toast.success("নম্বর বণ্টন মুছে ফেলা হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "নম্বর বণ্টন মুছতে ব্যর্থ হয়েছে")
    }
  }

  // Add question to paper
  const handleAddQuestion = async (qId: string, type: "MCQ" | "CQ" | "SHORT") => {
    if (!selectedDistId) {
      toast.error("প্রথমে বাম কলামের একটি নম্বর বণ্টন সেকশন সিলেক্ট করুন।")
      return
    }

    try {
      await addQuestionMutation.mutateAsync({
        questionPaperId: paper.id,
        mcqId: type === "MCQ" ? qId : null,
        cqId: type === "CQ" ? qId : null,
        shortAnswerId: type === "SHORT" ? qId : null,
        distributionId: selectedDistId,
        sectionId: null,
      })
      toast.success("প্রশ্ন প্রশ্নপত্রে সংযুক্ত হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "প্রশ্ন যুক্ত করতে ব্যর্থ হয়েছে")
    }
  }

  const handleRemoveQuestion = async (qId: string, type: "MCQ" | "CQ" | "SHORT") => {
    try {
      await removeQuestionMutation.mutateAsync({
        questionPaperId: paper.id,
        questionId: qId,
        questionType: type,
      })
      toast.success("প্রশ্ন প্রশ্নপত্র থেকে বাদ দেওয়া হয়েছে।")
    } catch (err: any) {
      toast.error(err.message || "প্রশ্ন বাদ দিতে ব্যর্থ হয়েছে")
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto font-display space-y-6">
      {/* Editor Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="rounded-lg h-9 w-9 border border-outline-variant shrink-0">
            <Link href="/question-papers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {paper.title}
              {paper.status === "Published" ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] uppercase font-bold rounded-full">
                  প্রকাশিত
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] uppercase font-bold rounded-full">
                  খসড়া
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground font-body">শ্রেণী: {paper.className} | পূর্ণমান: {paper.total} | সময়: {paper.timeInMinutes} মিনিট</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="rounded-lg border-outline-variant text-xs h-10 gap-2 cursor-pointer font-bold">
            <Link href={`/question-papers/${paper.id}/print`} target="_blank">
              <Printer className="h-4 w-4" /> প্রিন্ট প্রিভিউ
            </Link>
          </Button>
          <Button
            onClick={handlePublishToggle}
            className={`rounded-lg font-bold text-xs h-10 gap-2 cursor-pointer ${
              paper.status === "Published" ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {paper.status === "Published" ? (
              <>
                <AlertTriangle className="h-4 w-4" /> খসড়া করুন
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> প্রকাশ করুন
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Canvas / Structure Builder */}
        <div className="lg:col-span-7 space-y-6">
          {/* Subjects and mark breakdowns card */}
          <Card className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/30 pb-3">
              <CardTitle className="text-base font-bold text-foreground">১. বিষয় ও নম্বর বণ্টন কাঠামো</CardTitle>
              
              {/* Add Subject Trigger */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 gap-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                    <Plus className="h-3.5 w-3.5" /> বিষয় যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border rounded-xl p-6 font-display gap-4 max-w-sm">
                  <DialogHeader className="p-0 text-left">
                    <DialogTitle className="text-base font-bold">বিষয় নির্বাচন করুন</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={subjectForm.handleSubmit(handleAddSubject)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectSelect">বিষয়সমূহ</Label>
                      <Select onValueChange={(val: string) => subjectForm.setValue("subjectId", val)}>
                        <SelectTrigger className="w-full rounded-lg border bg-white py-2 px-3 font-body text-sm h-10 justify-between">
                          <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border rounded-lg font-body">
                          {globalSubjects.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.nameBn || s.nameEn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="submit" className="rounded-lg bg-primary text-white font-bold h-9">যোগ করুন</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 font-body">
              {paper.subjects.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground font-body">
                  কোনো বিষয় যুক্ত করা হয়নি। বিষয় যুক্ত করার পর নম্বর বণ্টন শুরু করুন।
                </div>
              ) : (
                paper.subjects.map((subject: any) => (
                  <div key={subject.id} className="border border-outline-variant/40 rounded-xl p-4 bg-muted/5 space-y-3">
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <h4 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
                        📚 {subject.subjectName} 
                        <Badge className="bg-primary/5 text-primary text-[10px] py-0 px-2 font-display">{subject.subjectTotal} নম্বর</Badge>
                      </h4>
                      <div className="flex gap-2">
                        {/* Add Mark distribution within subject */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="xs" variant="outline" className="rounded-md text-[10px] h-7 gap-1 font-display hover:bg-muted cursor-pointer">
                              নম্বর বণ্টন যোগ
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border rounded-xl p-6 font-display gap-4 max-w-sm">
                            <DialogHeader className="p-0 text-left">
                              <DialogTitle className="text-base font-bold">নম্বর বণ্টন কনফিগারেশন</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={distForm.handleSubmit((data) => handleAddDist(data, subject.id))} className="space-y-4">
                              <div className="space-y-1">
                                <Label className="text-xs">প্রশ্ন ধরণ</Label>
                                <Select onValueChange={(val: string) => distForm.setValue("questionTypeId", val)}>
                                  <SelectTrigger className="w-full rounded-lg border bg-white py-1.5 px-3 font-body text-sm h-10 justify-between">
                                    <SelectValue placeholder="প্রশ্ন ধরণ" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border rounded-lg font-body">
                                    {questionTypes.map((t: any) => (
                                      <SelectItem key={t.id} value={t.id}>{t.nameBn || t.nameEn} ({t.label})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <Label className="text-xs">প্রশ্ন প্রতি নম্বর</Label>
                                  <Input type="number" step="0.5" {...distForm.register("marksPerQuestion")} className="h-10 rounded-lg" />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">প্রশ্নের সংখ্যা</Label>
                                  <Input type="number" {...distForm.register("questionCount")} className="h-10 rounded-lg" />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">উত্তর দিতে হবে (ঐচ্ছিক, উদা: ৫ টির মধ্যে ৩ টি)</Label>
                                <Input type="number" placeholder="সবগুলো হলে ফাকা রাখুন" {...distForm.register("questionsToAttempt")} className="h-10 rounded-lg" />
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button type="submit" className="rounded-lg bg-primary text-white font-bold h-9">যোগ করুন</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="h-7 w-7 p-0 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mark distributions rows */}
                    <div className="space-y-2">
                      {subject.distributions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2 font-body">কোনো বণ্টন নেই।</p>
                      ) : (
                        subject.distributions.map((dist: any) => {
                          const isSelected = selectedDistId === dist.id
                          return (
                            <div
                              key={dist.id}
                              onClick={() => {
                                setSelectedDistId(dist.id)
                                setSelectedSubjectId(subject.subjectId)
                              }}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-xs"
                                  : "border-outline-variant/30 bg-white hover:border-outline-variant/60"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-foreground font-display flex items-center gap-1.5">
                                    ⚙️ {dist.questionTypeName}
                                    {dist.questionsToAttempt && (
                                      <span className="text-[10px] text-primary bg-primary/10 rounded-md px-1.5 py-0.2">{dist.questionsToAttempt} টি উত্তর আবশ্যক</span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">নম্বর: {dist.marksPerQuestion} × {dist.questionCount} টি = মোট {dist.totalMarks} নম্বর</p>
                                </div>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={(e: any) => {
                                    e.stopPropagation()
                                    handleDeleteDist(dist.id)
                                  }}
                                  className="h-6 w-6 p-0 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {/* Selected questions under this distribution */}
                              <div className="mt-2.5 space-y-1.5 border-t border-outline-variant/20 pt-2 font-body">
                                {paper.questions
                                  .filter((q: any) => q.distributionId === dist.id)
                                  .map((pq: any, i: number) => (
                                    <div key={pq.id} className="flex items-start justify-between gap-3 text-xs bg-muted/10 rounded-md p-2 border border-outline-variant/10">
                                      <div className="min-w-0 flex-1 flex gap-1.5">
                                        <span className="font-bold text-primary">{i + 1}.</span>
                                        <div className="min-w-0">
                                          {pq.contentSnapshot ? (
                                            <p className="text-[11px] font-medium text-foreground truncate">
                                              {pq.contentSnapshot.question || pq.contentSnapshot.stem || "Snapshot Content"}
                                            </p>
                                          ) : (
                                            <p className="text-[11px] italic text-muted-foreground">সংযুক্ত প্রশ্ন ID: {pq.mcqId || pq.cqId || pq.shortAnswerId}</p>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          const qId = pq.mcqId || pq.cqId || pq.shortAnswerId
                                          const type = pq.mcqId ? "MCQ" : pq.cqId ? "CQ" : "SHORT"
                                          handleRemoveQuestion(qId, type)
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold px-1.5 cursor-pointer"
                                      >
                                        বাদ
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Sections list card */}
          <Card className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/30 pb-3">
              <CardTitle className="text-base font-bold text-foreground">২. প্রশ্নপত্র সেকশন (অনুচ্ছেদ)</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 gap-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                    <Plus className="h-3.5 w-3.5" /> সেকশন যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border rounded-xl p-6 font-display gap-4 max-w-sm">
                  <DialogHeader className="p-0 text-left">
                    <DialogTitle className="text-base font-bold">সেকশন তৈরি করুন</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={sectionForm.handleSubmit(handleAddSection)} className="space-y-4 font-body">
                    <div className="space-y-1">
                      <Label className="text-xs">সেকশন নাম (English)</Label>
                      <Input placeholder="উদা: Section A" {...sectionForm.register("title")} className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">সেকশন নাম (Bengali)</Label>
                      <Input placeholder="উদা: ক-বিভাগ" {...sectionForm.register("titleBn")} className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">বিশেষ নির্দেশনা (ঐচ্ছিক)</Label>
                      <Input placeholder="উদা: যেকোনো ৫টি প্রশ্নের উত্তর দাও" {...sectionForm.register("instructions")} className="h-10 rounded-lg" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="submit" className="rounded-lg bg-primary text-white font-bold h-9">যোগ করুন</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {paper.sections.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 font-body">কোনো সেকশন যোগ করা হয়নি (ঐচ্ছিক)।</p>
              ) : (
                paper.sections.map((section: any) => (
                  <div key={section.id} className="flex items-center justify-between border border-outline-variant/40 rounded-xl p-3 bg-muted/5 font-body">
                    <div>
                      <p className="text-xs font-bold text-foreground font-display">{section.title} {section.titleBn ? `(${section.titleBn})` : ""}</p>
                      {section.instructions && (
                        <p className="text-[10px] text-muted-foreground font-body mt-0.5">{section.instructions}</p>
                      )}
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleDeleteSection(section.id)}
                      className="h-7 w-7 p-0 rounded-md text-red-500 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Question Bank Search & Selection */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-xl min-h-[500px]">
            <CardHeader className="border-b border-outline-variant/30 pb-3 space-y-3">
              <CardTitle className="text-base font-bold text-foreground">৩. প্রশ্ন ব্যাংক অনুসন্ধান</CardTitle>
              
              <div className="space-y-2 font-body">
                {selectedDistId ? (
                  <div className="bg-primary/5 rounded-lg border border-primary/20 p-2 text-xs flex items-center justify-between text-primary font-display">
                    <span>সক্রিয় সেকশন: নম্বর বণ্টন কনফিগারেশনে প্রশ্ন যোগ করা হবে।</span>
                    <button onClick={() => setSelectedDistId("")} className="font-bold hover:underline">রিসেট</button>
                  </div>
                ) : (
                  <div className="bg-amber-500/5 rounded-lg border border-amber-500/20 p-2 text-xs text-amber-700 flex gap-2 font-body">
                    <Info className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>প্রশ্ন যোগ করতে বাম কলামের একটি নম্বর বণ্টন কাঠামো সিলেক্ট করুন।</span>
                  </div>
                )}
                
                <Input
                  type="text"
                  placeholder="প্রশ্ন অনুসন্ধান করুন..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="h-10 rounded-lg"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
                <TabsList className="grid w-full grid-cols-3 bg-surface-container-high rounded-lg p-1 font-display">
                  <TabsTrigger value="MCQ" className="rounded-md font-bold text-xs py-1.5">MCQ</TabsTrigger>
                  <TabsTrigger value="CQ" className="rounded-md font-bold text-xs py-1.5">CQ</TabsTrigger>
                  <TabsTrigger value="SHORT" className="rounded-md font-bold text-xs py-1.5">Short Answer</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-4 font-body">
              {/* MCQ list */}
              {activeTab === "MCQ" && (
                <div className="space-y-2">
                  {isMcqLoading ? (
                    <div className="text-center text-xs text-muted-foreground py-10">অনলাইন ডাটা লোড হচ্ছে...</div>
                  ) : !mcqData || mcqData.items.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-10">কোনো MCQ প্রশ্ন পাওয়া যায়নি।</div>
                  ) : (
                    mcqData.items.map((item: any) => {
                      const isAdded = paper.questions.some((q: any) => q.mcqId === item.id)
                      return (
                        <div key={item.id} className="border border-outline-variant/30 rounded-xl p-3 bg-white hover:shadow-xs transition-shadow flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground font-body leading-normal">{item.question}</p>
                            {item.options && (
                              <div className="grid grid-cols-2 gap-2 mt-2 font-body text-[10px] text-muted-foreground">
                                {item.options.slice(0, 4).map((opt: string, i: number) => (
                                  <div key={i} className="truncate">({String.fromCharCode(97 + i)}) {opt}</div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            size="xs"
                            disabled={isAdded || !selectedDistId}
                            onClick={() => handleAddQuestion(item.id, "MCQ")}
                            className="rounded-md h-7 px-3 bg-primary text-primary-foreground font-bold shrink-0 text-[10px]"
                          >
                            {isAdded ? "যুক্ত" : "যোগ"}
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* CQ list */}
              {activeTab === "CQ" && (
                <div className="space-y-2">
                  {isCqLoading ? (
                    <div className="text-center text-xs text-muted-foreground py-10">অনলাইন ডাটা লোড হচ্ছে...</div>
                  ) : !cqData || cqData.items.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-10">কোনো CQ প্রশ্ন পাওয়া যায়নি।</div>
                  ) : (
                    cqData.items.map((item: any) => {
                      const isAdded = paper.questions.some((q: any) => q.cqId === item.id)
                      return (
                        <div key={item.id} className="border border-outline-variant/30 rounded-xl p-3 bg-white hover:shadow-xs transition-shadow flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground font-body leading-normal">{item.stem}</p>
                          </div>
                          <Button
                            size="xs"
                            disabled={isAdded || !selectedDistId}
                            onClick={() => handleAddQuestion(item.id, "CQ")}
                            className="rounded-md h-7 px-3 bg-primary text-primary-foreground font-bold shrink-0 text-[10px]"
                          >
                            {isAdded ? "যুক্ত" : "যোগ"}
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Short Answer list */}
              {activeTab === "SHORT" && (
                <div className="space-y-2">
                  {isShortLoading ? (
                    <div className="text-center text-xs text-muted-foreground py-10">অনলাইন ডাটা লোড হচ্ছে...</div>
                  ) : !shortData || shortData.items.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-10">কোনো সংক্ষিপ্ত প্রশ্ন পাওয়া যায়নি।</div>
                  ) : (
                    shortData.items.map((item: any) => {
                      const isAdded = paper.questions.some((q: any) => q.shortAnswerId === item.id)
                      return (
                        <div key={item.id} className="border border-outline-variant/30 rounded-xl p-3 bg-white hover:shadow-xs transition-shadow flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground font-body leading-normal">{item.question}</p>
                          </div>
                          <Button
                            size="xs"
                            disabled={isAdded || !selectedDistId}
                            onClick={() => handleAddQuestion(item.id, "SHORT")}
                            className="rounded-md h-7 px-3 bg-primary text-primary-foreground font-bold shrink-0 text-[10px]"
                          >
                            {isAdded ? "যুক্ত" : "যোগ"}
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
