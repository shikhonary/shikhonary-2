import { Suspense } from "react"
import type { Metadata } from "next"
import { JoinView } from "@/modules/refer/components/join-view"

export const metadata: Metadata = {
  title: "শিখনারীতে স্বাগতম | প্রাতিষ্ঠানিক রেফারেল পোর্টাল",
  description: "সহকর্মী শিক্ষা প্রতিষ্ঠানের আমন্ত্রণে শিখনারী প্ল্যাটফর্মে যুক্ত হোন এবং ফ্রি বোনাস এআই ক্রেডিট উপভোগ করুন",
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-headline text-xs font-bold text-muted-foreground">
          রেফারেল তথ্য লোড হচ্ছে...
        </div>
      }
    >
      <JoinView />
    </Suspense>
  )
}
