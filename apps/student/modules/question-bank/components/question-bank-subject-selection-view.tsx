"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Search,
  X,
  RotateCcw,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { trpc } from "@/trpc/client"
import { resolveSubjectTheme } from "../lib/subject-theme"

// ─── Types ─────────────────────────────────────────────────────────────────

interface SubjectItem {
  id: string
  name: string
  nameBn?: string | null
  group?: string | null
  questionCount: number
}

// ─── Component ─────────────────────────────────────────────────────────────

export function QuestionBankSubjectSelectionView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search query to prevent excessive database hits on typing
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch current student profile to get class ID
  const profileQuery = useQuery({
    ...trpc.student.getProfile.queryOptions(),
    staleTime: 5 * 60 * 1000,
  })

  const academicClassId = profileQuery.data?.academicClassId

  // Subjects are fetched from server matching class scope and query
  const subjectsQuery = useQuery({
    ...trpc.subject.list.queryOptions({
      page: 1,
      limit: 100,
      sort: "position_asc",
      academicClassId: academicClassId || undefined,
      query: debouncedSearch || undefined,
    }),
    enabled: profileQuery.isSuccess,
  })

  const statsQuery = useQuery(trpc.questionBank.stats.queryOptions(undefined))

  const dbSubjects = subjectsQuery.data?.items ?? []
  const statsData = statsQuery.data
  const isLoading = profileQuery.isLoading || subjectsQuery.isLoading

  // Build display list with MCQ counts merged in
  const displaySubjects = useMemo<SubjectItem[]>(() => {
    return dbSubjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      nameBn: (sub as any).nameBn ?? null,
      group: (sub as any).group ?? null,
      questionCount: statsData?.subjectCounts?.[sub.id] ?? 0,
    }))
  }, [dbSubjects, statsData])

  return (
    <div className="max-w-container-max mx-auto min-h-screen bg-background px-4 py-6 md:px-8 md:py-10">
      {/* ── Breadcrumb ── */}
      <Breadcrumb className="mb-5">
        <BreadcrumbList className="text-xs text-on-surface-variant">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-3.5 w-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-on-background">
              Question Bank
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Page header ── */}
      <header className="mb-7">
        <h1 className="mb-1.5 text-2xl font-extrabold tracking-tight text-on-background sm:text-3xl md:text-4xl">
          Question Bank
        </h1>
        <p className="max-w-xl text-sm text-on-surface-variant sm:text-base">
          Pick a subject to practise chapter-wise MCQs with detailed solutions.
        </p>
      </header>

      {/* ── Sticky search bar ── */}
      <div className="sticky top-16 z-30 mb-6">
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest/95 p-3 shadow-xs backdrop-blur-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              type="text"
              placeholder="Search subject…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border-outline-variant/30 bg-surface-container-low/50 pl-9 pr-8 text-sm placeholder:text-on-surface-variant/60 focus-visible:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading skeletons ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="flex items-center justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-3.5"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </Card>
          ))}
        </div>
      ) : displaySubjects.length > 0 ? (
        /* ── Subject card grid ── */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {displaySubjects.map((subject) => {
            const theme = resolveSubjectTheme(subject.name, subject.nameBn ?? "")
            const IconComponent = theme.icon

            return (
              <Link
                key={subject.id}
                href={`/question-bank/${subject.id}`}
                className="group block focus:outline-none"
              >
                <Card
                  className={cn(
                    "relative flex items-center justify-between overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 ease-out cursor-pointer",
                    "border-outline-variant/30 bg-surface-container-lowest",
                    "hover:-translate-y-1 hover:shadow-md",
                    theme.borderColor,
                    theme.hoverBg,
                    theme.glowClass
                  )}
                >
                  {/* Watermark background icon */}
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-2 -top-2 opacity-[0.03] transition-all duration-500 ease-out group-hover:scale-110 group-hover:opacity-[0.07]",
                      theme.watermarkColor
                    )}
                  >
                    <IconComponent className="h-16 w-16" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between gap-3.5 min-w-0 w-full">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Squircle Icon Container */}
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
                          theme.iconBgColor
                        )}
                      >
                        <IconComponent className="h-5.5 w-5.5" />
                      </div>

                      {/* Text details */}
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold tracking-tight text-on-background group-hover:text-primary transition-colors truncate">
                          {subject.name}
                        </h2>
                        <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80 mt-0.5">
                          <span className="shrink-0 font-medium">
                            {statsData
                              ? `${subject.questionCount} MCQ`
                              : "— MCQ"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Elegant Interactive Arrow Icon */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low text-on-surface-variant transition-all duration-300",
                        "group-hover:border-transparent group-hover:bg-primary group-hover:text-white"
                      )}
                    >
                      <ChevronRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center">
          <Search className="mb-3 h-10 w-10 text-on-surface-variant/30" />
          <h3 className="mb-1 text-base font-bold text-on-background">
            No subjects found
          </h3>
          <p className="mb-5 max-w-xs text-sm text-on-surface-variant">
            No subjects match your search.
          </p>
          <Button
            onClick={() => setSearchQuery("")}
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Search
          </Button>
        </div>
      )}
    </div>
  )
}
