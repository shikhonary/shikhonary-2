import type { Metadata } from "next"
import { QuestionPaperManagementView } from "@/modules/question-paper/components/question-paper-management-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্র ব্যবস্থাপনা | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের পরীক্ষা ভিত্তিক প্রশ্নপত্র প্রণয়ন ও সম্পাদন পরিচালনা",
}

export default function QuestionPapersPage() {
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <QuestionPaperManagementView />
    </div>
  )
}
