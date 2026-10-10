import type { Metadata } from "next"
import { SubscriptionPlansView } from "@/modules/subscription-plan/ui/views/subscription-plans-view"

export const metadata: Metadata = {
  title: "সাবস্ক্রিপশন ও প্ল্যান ব্যবস্থাপনা | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বর্তমান সাবস্ক্রিপশন প্যাকেজ, রিসোর্স কোটা, এআই ক্রেডিট ও বিলিং ইনভয়েস পর্যালোচনা করুন",
}

export default function SubscriptionPage() {
  return <SubscriptionPlansView />
}
