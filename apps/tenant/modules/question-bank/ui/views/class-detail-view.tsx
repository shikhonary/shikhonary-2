"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useQuestionBankClassDetails } from "../../services/use-question-bank"
import { ClassHeader } from "../components/class-detail/class-header"
import { ClassKpiStats } from "../components/class-detail/class-kpi-stats"
import { SubjectsGrid } from "../components/class-detail/subjects-grid"
import { ChapterPreviewDialog } from "../components/class-detail/chapter-preview-dialog"
import { MobileClassDetail } from "../components/class-detail/mobile-class-detail"
import { CurriculumGuideBanner } from "../components/classes/curriculum-guide-banner"
import type { AcademicSubjectWithChapters } from "../../types"

interface ClassDetailViewProps {
  classId: string
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({ classId }) => {
  const [search, setSearch] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<AcademicSubjectWithChapters | null>(null)

  const { data, isLoading, error } = useQuestionBankClassDetails(classId)

  const classData = data?.class
  const subjects = (data?.subjects as AcademicSubjectWithChapters[]) ?? []
  const totalSubjects = data?.totalSubjects ?? 0
  const totalChapters = data?.totalChapters ?? 0
  const totalQuestions = data?.totalQuestions ?? 0

  // Filter subjects by search keyword
  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjects
    const q = search.trim().toLowerCase()
    return subjects.filter((s) => {
      const matchName =
        s.nameBn.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q)
      const matchCode = s.code ? s.code.toLowerCase().includes(q) : false
      const matchChapter = s.chapters.some(
        (ch) =>
          ch.nameBn.toLowerCase().includes(q) ||
          ch.nameEn.toLowerCase().includes(q)
      )
      return matchName || matchCode || matchChapter
    })
  }, [subjects, search])

  if (error || (!isLoading && !classData)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-card rounded-2xl border border-border/50 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-headline text-foreground">
          শ্রেণি পাওয়া যায়নি
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1 max-w-sm">
          অনুরোধকৃত শ্রেণির তথ্য খুঁজে পাওয়া যায়নি অথবা তা নিষ্ক্রিয় করা হয়েছে।
        </p>
        <Button asChild className="mt-6 rounded-xl text-xs font-bold" size="sm">
          <Link href="/question-bank">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>সকল শ্রেণিতে ফিরে যান</span>
          </Link>
        </Button>
      </div>
    )
  }

  const classNameBn = classData?.nameBn ?? ""
  const classNameEn = classData?.nameEn ?? ""

  return (
    <>
      {/* ── Desktop View (hidden on mobile) ───────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-8 w-full min-w-0">
          {/* Header */}
          <ClassHeader
            classNameBn={classNameBn}
            classNameEn={classNameEn}
            classId={classId}
            totalSubjects={totalSubjects}
            totalChapters={totalChapters}
            totalQuestions={totalQuestions}
            search={search}
            onSearchChange={setSearch}
            isLoading={isLoading}
          />

          {/* KPI Stats */}
          <ClassKpiStats
            totalSubjects={totalSubjects}
            totalChapters={totalChapters}
            totalQuestions={totalQuestions}
            isLoading={isLoading}
          />

          {/* Subjects Grid */}
          <SubjectsGrid
            subjects={filteredSubjects}
            classId={classId}
            isLoading={isLoading}
            onSelectSubject={(sub) => setSelectedSubject(sub)}
          />

          {/* Curriculum Guide Banner */}
          <CurriculumGuideBanner />
        </main>
      </div>

      {/* ── Mobile View (hidden on desktop) ────────────────────────── */}
      <div className="md:hidden -m-4 sm:-m-6">
        <MobileClassDetail
          classNameBn={classNameBn}
          classNameEn={classNameEn}
          classId={classId}
          totalSubjects={totalSubjects}
          totalChapters={totalChapters}
          totalQuestions={totalQuestions}
          subjects={filteredSubjects}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSelectSubject={(sub) => setSelectedSubject(sub)}
        />
      </div>

      {/* ── Chapter Preview Dialog ─────────────────────────────────── */}
      <ChapterPreviewDialog
        selectedSubject={selectedSubject}
        classId={classId}
        classNameBn={classNameBn}
        onClose={() => setSelectedSubject(null)}
      />
    </>
  )
}
