import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CreateQuestionPaperStepper } from "./create-question-paper-stepper"

export function CreateQuestionPaperView() {
  return (
    <div className="w-full space-y-6 sm:space-y-8 font-body">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <nav className="mb-2 flex items-center space-x-2 text-xs text-muted-foreground font-body">
            <Link
              href="/question-papers"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>প্রশ্নপত্র</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">নতুন তৈরি</span>
          </nav>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            নতুন প্রশ্নপত্র প্রণয়ন
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-body">
            ধাপে ধাপে পরীক্ষার প্রাথমিক তথ্য, বিষয় ও নম্বর বণ্টন নির্বাচন করে পূর্ণাঙ্গ প্রশ্নপত্র তৈরি করুন।
          </p>
        </div>
      </div>

      {/* Multi-Step Wizard */}
      <CreateQuestionPaperStepper />
    </div>
  )
}
