import type { Metadata } from "next"
import { ClassDetailView } from "@/modules/question-bank/ui/views/class-detail-view"

export const metadata: Metadata = {
  title: "শ্রেণিভিত্তিক প্রশ্নভাণ্ডার | শিখনারী পোর্টাল",
  description: "নির্দিষ্ট শ্রেণির পাঠ্য বিষয়, অধ্যায় ও প্রশ্ন পর্যালোচনা এবং কাস্টম প্রশ্নপত্র তৈরি করুন",
}

interface ClassQuestionBankPageProps {
  params: Promise<{ classId: string }>
}

export default async function ClassQuestionBankPage({
  params,
}: ClassQuestionBankPageProps) {
  const { classId } = await params

  return <ClassDetailView classId={classId} />
}
