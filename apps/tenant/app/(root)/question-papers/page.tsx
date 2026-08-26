import type { Metadata } from "next"
import { QuestionPaperManagementView } from "@/modules/question-paper/components/question-paper-management-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্র ব্যবস্থাপনা | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের পরীক্ষা ভিত্তিক প্রশ্নপত্র প্রণয়ন ও সম্পাদন পরিচালনা",
}

export default function QuestionPapersPage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6 max-w-6xl mx-auto">
      <QuestionPaperManagementView />
    </div>
  )
}
