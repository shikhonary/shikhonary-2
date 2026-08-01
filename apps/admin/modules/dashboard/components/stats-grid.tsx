"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Users, Layers, BookOpen, Percent } from "lucide-react"
import { BubbleGrid } from "./bubble-grid"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery(trpc.dashboard.getStats.queryOptions())

  const displayStats = {
    students: stats?.totalStudents ?? 0,
    activeExamGroups: stats?.publishedExamGroups ?? 0,
    mcqBank: stats?.totalMcqs ?? 0,
    avgMerit: stats?.avgMerit ?? 0,
  }

  const cards = [
    {
      label: "Total Students",
      sub: "Active profiles",
      value: displayStats.students.toLocaleString(),
      icon: Users,
    },
    {
      label: "Exam Groups",
      sub: "Published groups",
      value: displayStats.activeExamGroups.toString(),
      icon: Layers,
    },
    {
      label: "Question Bank",
      sub: "Total MCQs",
      value: displayStats.mcqBank.toLocaleString(),
      icon: BookOpen,
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
      {/* First 3 regular stat cards */}
      {cards.map(({ label, sub, value, icon: Icon }) => (
        <div
          key={label}
          className="bg-card text-card-foreground border border-border rounded-xl p-3 sm:p-5 shadow-level-1 hover:shadow-level-2 transition-shadow duration-200 group flex items-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground truncate leading-none">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 lg:h-9 w-20 sm:w-28 mt-1" />
            ) : (
              <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-foreground mt-1 leading-none font-mono group-hover:text-primary transition-colors duration-150 tabular-nums">
                {value}
              </p>
            )}
            <p className="hidden sm:block text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</p>
          </div>
          <div className="hidden sm:flex shrink-0 ml-3 h-11 w-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      ))}

      {/* Avg Merit card — spans full width on mobile */}
      <div className="col-span-2 xl:col-span-1 bg-card text-card-foreground border border-border rounded-xl p-3 sm:p-5 shadow-level-1 hover:shadow-level-2 transition-shadow duration-200 group">
        {/* Mobile View */}
        <div className="flex items-center gap-3 xl:hidden">
          <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Percent className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate leading-none">
              Avg Merit
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-16 mt-1" />
            ) : (
              <p className="text-lg font-extrabold text-foreground font-mono leading-tight group-hover:text-primary transition-colors duration-150 mt-0.5 tabular-nums">
                {displayStats.avgMerit}%
              </p>
            )}
          </div>
          <div className="hidden sm:flex xl:hidden shrink-0">
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <BubbleGrid pct={displayStats.avgMerit} cols={8} rows={2} size={6} gap={2.5} fill="var(--primary)" />
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden xl:block">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Avg Merit Score
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-3xl font-extrabold text-foreground mt-1 leading-none font-mono group-hover:text-primary transition-colors duration-150 tabular-nums">
                  {displayStats.avgMerit}%
                </p>
              )}
            </div>
            <div className="shrink-0 ml-3 h-11 w-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex justify-center">
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <BubbleGrid pct={displayStats.avgMerit} cols={12} rows={2} size={7} gap={3} fill="var(--primary)" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
