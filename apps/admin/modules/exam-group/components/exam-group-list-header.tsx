"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"

export function ExamGroupListHeader() {
  return (
    <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
          Exam Groups
        </h2>
        <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant">
          Bundle individual exams, configure weightage & calculation modes, and generate merit leaderboards.
        </p>
      </div>
      <Button
        asChild
        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 sm:py-3 font-headline-md text-sm sm:text-base font-bold text-on-primary-container shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer overflow-hidden"
      >
        <Link href="/exam-groups/create">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">Create Exam Group</span>
        </Link>
      </Button>
    </section>
  )
}
