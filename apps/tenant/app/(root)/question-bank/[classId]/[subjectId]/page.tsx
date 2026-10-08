import type { Metadata } from "next"
import { SubjectResourceExplorerView } from "@/modules/question-bank/ui/views/subject-resource-explorer-view"

export const metadata: Metadata = {
  title: "বিষয়ভিত্তিক প্রশ্নভাণ্ডার অন্বেষণ | শিখনারী পোর্টাল",
  description: "নির্দিষ্ট বিষয়ের সকল ধরনের প্রশ্ন পর্যালোচনা, বুকমার্ক ও কাস্টম প্রশ্নপত্র তৈরি করুন",
}

interface SubjectQuestionBankPageProps {
  params: Promise<{ classId: string; subjectId: string }>
}

export default async function SubjectQuestionBankPage({
  params,
}: SubjectQuestionBankPageProps) {
  const { classId, subjectId } = await params

  return <SubjectResourceExplorerView classId={classId} subjectId={subjectId} />
}
