import type { Metadata } from "next"
import { EditQuestionPaperView } from "@/modules/question-paper/components/edit-question-paper-view"

export const metadata: Metadata = {
  title: "প্রশ্নপত্র সম্পাদনা | শিখনারী পোর্টাল",
  description: "প্রশ্নপত্রের কাঠামো ও প্রশ্ন সংযোগ বিবরণ পরিবর্তন",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPaperPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="w-full">
      <EditQuestionPaperView id={id} />
    </div>
  )
}
