import type { Metadata } from "next"
import { PrintQuestionPaperView } from "@/modules/question-paper/components/print-question-paper-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্র প্রিন্ট প্রিভিউ | শিখনারী পোর্টাল",
  description: "পরীক্ষার প্রশ্নপত্র প্রিন্ট বা সংরক্ষণ করুন",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintQuestionPaperPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="w-full min-h-screen bg-white">
      <PrintQuestionPaperView id={id} />
    </div>
  )
}
