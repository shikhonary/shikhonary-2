"use client"

import React, { useState, useMemo } from "react"
import { ClassesHeader } from "../components/classes/classes-header"
import { ClassesStats } from "../components/classes/classes-stats"
import { ClassesGrid } from "../components/classes/classes-grid"
import { MobileClassesList } from "../components/classes/mobile-classes-list"
import { ClassDetailModal } from "../components/classes/class-detail-modal"
import { CurriculumGuideBanner } from "../components/classes/curriculum-guide-banner"
import { useQuestionBankClasses } from "../../services/use-question-bank"
import type { AcademicClassItem } from "../../types"

export const QuestionBankView: React.FC = () => {
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<AcademicClassItem | null>(null)

  const { data: classesData, isLoading } = useQuestionBankClasses()

  const allClasses = (classesData?.classes as AcademicClassItem[]) ?? []
  const totalClasses = classesData?.totalClasses ?? allClasses.length
  const totalSubjects = classesData?.totalSubjects ?? 0

  // Filter classes by search query
  const filteredClasses = useMemo(() => {
    if (!search.trim()) return allClasses
    const q = search.trim().toLowerCase()
    return allClasses.filter((c) => {
      const matchClassName =
        c.nameBn.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q)
      const matchSubject = c.subjects.some(
        (s) =>
          s.nameBn.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q)
      )
      return matchClassName || matchSubject
    })
  }, [allClasses, search])

  return (
    <>
      {/* ── Desktop View (hidden on mobile) ───────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-50/50 dark:bg-background relative isolate w-full min-w-0">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10 space-y-8 w-full min-w-0">
          {/* Header */}
          <ClassesHeader search={search} onSearchChange={setSearch} />

          {/* Stats Overview (4 KPI Cards) */}
          <ClassesStats
            totalClasses={totalClasses}
            totalSubjects={totalSubjects}
            isLoading={isLoading}
          />

          {/* Classes Grid Section with Level Tabs */}
          <ClassesGrid
            classes={filteredClasses}
            isLoading={isLoading}
            onSelectClass={(cls) => setSelectedClass(cls)}
          />

          {/* Curriculum Guide Banner */}
          <CurriculumGuideBanner />
        </main>
      </div>

      {/* ── Mobile View (hidden on desktop) ────────────────────────── */}
      <div className="md:hidden w-full min-w-0">
        <MobileClassesList
          classes={filteredClasses}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          onSelectClass={(cls) => setSelectedClass(cls)}
          totalClasses={totalClasses}
          totalSubjects={totalSubjects}
        />
      </div>

      {/* ── Class Curriculum Detail Modal ─────────────────────────── */}
      <ClassDetailModal
        selectedClass={selectedClass}
        onClose={() => setSelectedClass(null)}
      />
    </>
  )
}

