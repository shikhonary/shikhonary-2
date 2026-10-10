import type { Metadata } from "next"
import { CreditsView } from "@/modules/subscription-plan/ui/views/credits-view"

export const metadata: Metadata = {
  title: "এআই ক্রেডিট প্ল্যান ও টপ-আপ | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বর্তমান এআই ক্রেডিট ব্যালেন্স, টপ-আপ প্যাকসমূহ এবং ক্রেডিট খরচের ইতিহাস পর্যালোচনা করুন",
}

export default function CreditsPage() {
  return <CreditsView />
}
