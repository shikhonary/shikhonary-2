import type { Metadata } from "next"
import { QuestionBankView } from "@/modules/question-bank/ui/views/question-bank-view"

export const metadata: Metadata = {
  title: "প্রশ্ন ব্যাংক | শিখনারী পোর্টাল",
  description: "জাতীয় শিক্ষাক্রম ও বোর্ড প্রশ্নভাণ্ডার থেকে প্রশ্ন অনুসন্ধান ও পর্যালোচনা করুন",
}

export default function QuestionBankPage() {
  return <QuestionBankView />
}
