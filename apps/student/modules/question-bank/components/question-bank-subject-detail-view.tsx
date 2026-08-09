"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  ChevronRight,
  HelpCircle,
  FileText,
  Sparkles,
  Clock,
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"
import { trpc } from "@/trpc/client"
import { resolveSubjectTheme } from "../lib/subject-theme"
import { QuestionBankMcqListView } from "./question-bank-mcq-list-view"
import { QuestionBankCqListView } from "./question-bank-cq-list-view"

interface QuestionBankSubjectDetailViewProps {
  subjectId: string
}

export function QuestionBankSubjectDetailView({
  subjectId,
}: QuestionBankSubjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>("mcq")

  const subjectQuery = useQuery(
    trpc.subject.byId.queryOptions({ id: subjectId })
  )
  const statsQuery = useQuery(
    trpc.questionBank.stats.queryOptions({ subjectId })
  )

  const subject = subjectQuery.data
  const stats = statsQuery.data
  const isLoading = subjectQuery.isLoading

  const theme = resolveSubjectTheme(subject?.name, subject?.nameBn)
  const IconComponent = theme.icon
  const totalMcqs = stats?.totalCount ?? 0

  return (
    <div className="max-w-container-max mx-auto px-4 py-6 md:px-8 md:py-10 bg-background min-h-screen">
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
            <BreadcrumbLink asChild>
              <Link
                href="/question-bank"
                className="hover:text-primary transition-colors"
              >
                Question Bank
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-3.5 w-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium text-on-background">
              {subject?.name ?? subject?.nameBn ?? "Subject Details"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Subject header card ── */}
      <header className="relative mb-6 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xs sm:p-7">
        {/* Decorative watermark */}
        <div className={cn("pointer-events-none absolute -right-4 -top-4 opacity-[0.04]", theme.watermarkColor)}>
          <IconComponent className="h-44 w-44" />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <Skeleton className="h-7 w-56 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        ) : (
          <div className="relative z-10">
            {/* Mobile-first: stacked, desktop: side-by-side */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              {/* Icon + name */}
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14",
                    theme.iconBgColor
                  )}
                >
                  <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold leading-tight text-on-background sm:text-2xl">
                    {subject?.name ?? subject?.nameBn}
                  </h1>
                  {subject?.nameBn && subject.name && (
                    <p className="mt-0.5 text-sm text-on-surface-variant">
                      {subject.nameBn}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {(subject as any)?.level && (
                      <Badge
                        variant="outline"
                        className="border-outline-variant/40 bg-surface-container-low text-xs text-on-surface"
                      >
                        {(subject as any).level}
                      </Badge>
                    )}
                    {(subject as any)?.group && (
                      <Badge className="bg-primary/10 text-xs font-semibold text-primary">
                        {(subject as any).group}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* MCQ count badge */}
              <div className="flex items-center gap-3 self-start rounded-xl border border-outline-variant/30 bg-surface-container-low px-2 py-1">
                <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-bold text-on-background">
                    {totalMcqs} MCQ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Tabs Content ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab nav */}
        <div className="mb-5 border-b border-outline-variant/40">
          <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="mcq"
              className="inline-flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors normal-case tracking-normal data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <HelpCircle className="h-4 w-4 hidden md:block" />
              <span className="hidden sm:inline">MCQ Questions</span>
              <span className="sm:hidden">MCQ</span>
              {totalMcqs > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  {totalMcqs}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="cq"
              className="inline-flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors normal-case tracking-normal data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <FileText className="h-4 w-4 hidden md:block" />
              <span className="hidden sm:inline">CQ Questions</span>
              <span className="sm:hidden">CQ</span>
            </TabsTrigger>
            <TabsTrigger
              value="short"
              className="inline-flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors normal-case tracking-normal data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              <Sparkles className="h-4 w-4 hidden md:block" />
              <span className="hidden sm:inline">Short Questions</span>
              <span className="sm:hidden">Short Q</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* MCQ tab — simple full-width layout */}
        <TabsContent value="mcq" className="focus-visible:outline-none">
          <div className="min-w-0 flex-1">
            <QuestionBankMcqListView subjectId={subjectId} />
          </div>
        </TabsContent>

        {/* CQ tab */}
        <TabsContent value="cq" className="focus-visible:outline-none">
          <div className="min-w-0 flex-1">
            <QuestionBankCqListView subjectId={subjectId} />
          </div>
        </TabsContent>

        {/* Short Q — coming soon */}
        <TabsContent value="short" className="focus-visible:outline-none">
          <Card className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100/70 text-blue-700">
              <Clock className="h-7 w-7" />
            </div>
            <h3 className="mb-1.5 text-lg font-bold text-on-background">Short Questions Coming Soon</h3>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-on-surface-variant">
              One-word answers and important short Q&As are currently under development.
            </p>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 px-3 py-1 text-blue-800">
              Under Development
            </Badge>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
