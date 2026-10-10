import type { Metadata } from "next"
import { UnderDevelopmentView } from "@/components/under-development-view"

export const metadata: Metadata = {
  title: "রেফার ও রিওয়ার্ডস | শিখনারী পোর্টাল",
  description: "অন্যান্য শিক্ষক বা প্রতিষ্ঠানকে শিখনারী রেফার করে আকর্ষণীয় বোনাস ক্রেডিট ও ক্যাশব্যাক অর্জন করুন",
}

export default function ReferPage() {
  return (
    <UnderDevelopmentView
      title="রেফারেল ও রিওয়ার্ডস প্রোগ্রাম"
      description="অন্যান্য শিক্ষক বা শিক্ষা প্রতিষ্ঠানকে শিখনারীতে আমন্ত্রণ জানিয়ে ফ্রি এআই ক্রেডিট ও বিশেষ রিওয়ার্ড বোনাস পান।"
      iconName="share"
      badgeText="উন্নয়ন চলছে"
    />
  )
}
