"use client"

import Link from "next/link"
import { CreateQuestionPaperStepper } from "./create-question-paper-stepper"

export function CreateQuestionPaperView() {
  return (
    <div className="w-full max-w-4xl mx-auto font-display">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant font-body">
            <Link
              href="/question-papers"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              প্রশ্নপত্র
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">নতুন তৈরি</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            নতুন প্রশ্নপত্র
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed font-body">
            প্রশ্নপত্র প্রণয়নের জন্য ধাপে ধাপে সকল তথ্য পূরণ করুন।
          </p>
        </div>
      </div>

      {/* Multi-Step Wizard */}
      <CreateQuestionPaperStepper />
    </div>
  )
}
