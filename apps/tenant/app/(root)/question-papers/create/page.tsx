import type { Metadata } from "next"
import { CreateQuestionPaperView } from "@/modules/question-paper/components/create-question-paper-view"

export const metadata: Metadata = {
  title: "নতুন প্রশ্নপত্র তৈরি | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের পরীক্ষার জন্য নতুন প্রশ্নপত্র তৈরি করুন",
}

export default function CreateQuestionPaperPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6 max-w-6xl mx-auto">
      <CreateQuestionPaperView />
    </div>
  )
}
