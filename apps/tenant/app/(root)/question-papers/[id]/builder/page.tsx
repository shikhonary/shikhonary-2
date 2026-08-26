import type { Metadata } from "next"
import { QuestionPaperBuilderView } from "@/modules/question-paper-builder/ui/views/question-paper-builder-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্র বিল্ডার | শিখনারী পোর্টাল",
  description: "প্রশ্নপত্র ডিজাইন, প্রশ্ন নির্বাচন ও লেআউট পরিচালনা",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuestionPaperBuilderPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="w-full h-full min-h-screen">
      <QuestionPaperBuilderView paperId={id} />
    </div>
  )
}
