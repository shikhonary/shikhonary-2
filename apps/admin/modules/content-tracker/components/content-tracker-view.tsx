"use client"

import * as React from "react"
import { useContentTrackerSearchParams } from "../hooks/use-content-tracker-search-params"
import { useContentTrackerSubjectPipeline } from "../services/use-content-tracker"
import {
  useAcademicClassesForSelection,
  useSubjectsForSelection,
  useChaptersForSelection,
} from "@/modules/mcq/services/use-mcq"
import { ContentTrackerHeader } from "./content-tracker-header"
import { ContentTrackerStatsCards } from "./content-tracker-stats-cards"
import { ContentTrackerFilters } from "./content-tracker-filters"
import { PipelineMatrix } from "./pipeline-matrix"
import { MissingAttachmentDesk } from "./missing-attachment-desk"
import { QualityControlDesk } from "./quality-control-desk"
import { BookOpen, GraduationCap } from "lucide-react"

export function ContentTrackerView() {
  const [
    { tab, classId, subjectId, chapterId, status, page, limit },
    setSearchParams,
  ] = useContentTrackerSearchParams()

  // 1. Fetch academic classes
  const { data: academicClasses = [], isLoading: isClassesLoading } =
    useAcademicClassesForSelection()

  // 2. Fetch subjects scoped by selected classId
  const { data: subjects = [], isLoading: isSubjectsLoading } =
    useSubjectsForSelection(
      classId !== "All" ? { academicClassId: classId } : undefined,
    )

  // 3. Fetch chapters scoped by selected subjectId
  const { data: chapters = [] } = useChaptersForSelection(
    subjectId !== "All" ? { subjectId } : undefined,
  )

  const isSubjectSelected = Boolean(subjectId && subjectId !== "All")
  const effectiveSubjectId = isSubjectSelected ? subjectId : ""

  // 4. Fetch subject pipeline data only when subject is selected
  const {
    data: pipelineData,
    isLoading: isPipelineLoading,
    refetch: refetchPipeline,
  } = useContentTrackerSubjectPipeline(effectiveSubjectId)

  const handleRefresh = () => {
    if (effectiveSubjectId) {
      refetchPipeline()
    }
  }

  const pipelineChapters = pipelineData?.chapters ?? []
  const summary = pipelineData?.summary

  // Calculate breakdown numbers
  const mcqCount = pipelineChapters.reduce((sum, ch) => sum + ch.mcqCount, 0)
  const cqCount = pipelineChapters.reduce((sum, ch) => sum + ch.cqCount, 0)
  const saCount = pipelineChapters.reduce(
    (sum, ch) => sum + ch.shortAnswerCount,
    0,
  )

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header (Shows tabs only when subject is selected) */}
      <ContentTrackerHeader
        activeTab={tab}
        onTabChange={(nextTab) => setSearchParams({ tab: nextTab, page: 1 })}
        onRefresh={handleRefresh}
        isLoading={isPipelineLoading}
        missingVisualCount={summary?.missingVisual}
        pendingIssuesCount={
          (summary?.pendingReports ?? 0) + (summary?.totalInactive ?? 0)
        }
        showTabs={isSubjectSelected}
      />

      {/* 2. Filter Bar (No search input, cascade: Class -> Subject -> Chapter) */}
      <ContentTrackerFilters
        selectedClassId={classId}
        onClassChange={(newClassId) =>
          setSearchParams({
            classId: newClassId,
            subjectId: "All",
            chapterId: "All",
            page: 1,
          })
        }
        academicClasses={academicClasses}
        selectedSubjectId={subjectId}
        onSubjectChange={(newSubjectId) =>
          setSearchParams({
            subjectId: newSubjectId,
            chapterId: "All",
            page: 1,
          })
        }
        subjects={subjects}
        selectedChapterId={chapterId}
        onChapterChange={(newChapterId) =>
          setSearchParams({ chapterId: newChapterId, page: 1 })
        }
        chapters={chapters}
        selectedStatus={status}
        onStatusChange={(newStatus) =>
          setSearchParams({ status: newStatus, page: 1 })
        }
        showStatusFilter={isSubjectSelected && tab === "quality"}
        isSubjectDisabled={classId === "All"}
        isChapterDisabled={!isSubjectSelected}
        onResetAll={() =>
          setSearchParams({
            classId: "All",
            subjectId: "All",
            chapterId: "All",
            status: "All",
            page: 1,
          })
        }
      />

      {/* 3. Conditional Content: Show prompt if no subject is selected */}
      {!isSubjectSelected ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-card p-12 sm:p-16 text-center space-y-4 shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-primary/10 text-indigo-600 dark:text-primary mx-auto border border-indigo-100/80 dark:border-primary/20">
            {classId === "All" ? (
              <GraduationCap className="h-7 w-7" />
            ) : (
              <BookOpen className="h-7 w-7" />
            )}
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-foreground font-headline">
              {classId === "All"
                ? "প্রথমে শ্রেণি ও বিষয় নির্বাচন করুন"
                : "এবার বিষয় নির্বাচন করুন"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              {classId === "All"
                ? "সিলেবাসের অগ্রগতি, অধ্যায়ভিত্তিক প্রশ্ন ব্যাংক, অনুপস্থিত ডায়াগ্রাম এবং প্রুফরিডিং স্ট্যাটাস নিরীক্ষণ করতে উপরের ফিল্টার থেকে শ্রেণি এবং পরবর্তীতে বিষয় নির্বাচন করুন।"
                : "নির্বাচিত শ্রেণির সিলেবাস অগ্রগতি ও প্রশ্ন ব্যাংকের তথ্য দেখতে উপরের ফিল্টার থেকে একটি বিষয় নির্বাচন করুন।"}
            </p>
          </div>
        </div>
      ) : (
        /* 4. When Subject is Selected: Show StatsCards & Tab View */
        <>
          <ContentTrackerStatsCards
            totalQuestions={summary?.totalQuestions}
            mcqCount={mcqCount}
            cqCount={cqCount}
            shortAnswerCount={saCount}
            activeCount={summary?.totalActive}
            inactiveCount={summary?.totalInactive}
            activeRate={summary?.activeRate}
            totalVisual={summary?.totalVisual}
            uploadedVisual={summary?.uploadedVisual}
            missingVisual={summary?.missingVisual}
            attachmentRate={summary?.attachmentRate}
            pendingReports={summary?.pendingReports}
            totalTables={summary?.totalTables}
            isLoading={isPipelineLoading}
          />

          {tab === "matrix" && (
            <PipelineMatrix
              chapters={pipelineChapters}
              isLoading={isPipelineLoading}
              onSelectChapterForAttachments={(chId) =>
                setSearchParams({
                  tab: "attachments",
                  chapterId: chId,
                  page: 1,
                })
              }
              onSelectChapterForProofing={(chId) =>
                setSearchParams({ tab: "quality", chapterId: chId, page: 1 })
              }
            />
          )}

          {tab === "attachments" && (
            <MissingAttachmentDesk
              subjectId={effectiveSubjectId}
              chapterId={chapterId}
              page={page}
              limit={limit}
              onPageChange={(p) => setSearchParams({ page: p })}
              onLimitChange={(l) => setSearchParams({ limit: l, page: 1 })}
            />
          )}

          {tab === "quality" && (
            <QualityControlDesk
              subjectId={effectiveSubjectId}
              chapterId={chapterId}
              statusFilter={status}
              page={page}
              limit={limit}
              onPageChange={(p) => setSearchParams({ page: p })}
              onLimitChange={(l) => setSearchParams({ limit: l, page: 1 })}
            />
          )}
        </>
      )}
    </div>
  )
}
