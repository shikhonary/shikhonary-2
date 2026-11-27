"use client"

import Link from "next/link"
import { ArrowLeft, Bookmark, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { CreateQuestionPaperStepper } from "./create-question-paper-stepper"
import { TemplatePickerModal } from "./template-picker-modal"
import { useTemplatePickerModalStore } from "../store/use-template-picker-modal-store"

export function CreateQuestionPaperView() {
  const openTemplateModal = useTemplatePickerModalStore((state) => state.openModal)

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

      {/* Fast-Track Banner: Start from Template */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="size-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <span>সংরক্ষিত টেমপ্লেট দিয়ে দ্রুত শুরু করুন</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs font-headline">
                সময় বাঁচান
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              পূর্বের নির্ধারিত নম্বর বণ্টন ও কাঠামো ব্যবহার করে এক ক্লিকেই নতুন প্রশ্নপত্র তৈরি করুন
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => openTemplateModal()}
          className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs gap-1.5 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>টেমপ্লেট ব্রাউজ করুন</span>
        </Button>
      </div>

      {/* Multi-Step Wizard */}
      <CreateQuestionPaperStepper />

      {/* Template Picker Modal */}
      <TemplatePickerModal />
    </div>
  )
}
