import type { Metadata } from "next"
import { QuestionPaperCostView } from "@/modules/question-paper/components/cost/question-paper-cost-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্রের ক্রেডিট খরচ বিবরণী | শিখনারী পোর্টাল",
  description: "নির্দিষ্ট প্রশ্নপত্রের মানবণ্টনভিত্তিক ইউনিট ক্রেডিট রেট, মোট বাজেট ও লেনদেনের বিস্তারিত হিসাব",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuestionPaperCostPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <QuestionPaperCostView id={id} />
    </div>
  )
}
