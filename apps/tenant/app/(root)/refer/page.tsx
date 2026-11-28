import type { Metadata } from "next"
import { ReferralView } from "@/modules/refer/components/referral-view"

export const metadata: Metadata = {
  title: "রেফারেল ও রিওয়ার্ডস | শিখনারী পোর্টাল",
  description: "অন্যান্য শিক্ষক বা প্রতিষ্ঠানকে শিখনারী রেফার করে আকর্ষণীয় বোনাস ক্রেডিট ও ক্যাশব্যাক অর্জন করুন",
}

export default function ReferPage() {
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <ReferralView />
    </div>
  )
}
