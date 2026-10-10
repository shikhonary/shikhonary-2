import type { Metadata } from "next"
import { UnderDevelopmentView } from "@/components/under-development-view"

export const metadata: Metadata = {
  title: "অনলাইন পরীক্ষা | শিখনারী পোর্টাল",
  description: "শিক্ষার্থীদের জন্য লাইভ অনলাইন এমসিকিউ ও লিখিত পরীক্ষা পরিচালনা",
}

export default function OnlineExamPage() {
  return (
    <UnderDevelopmentView
      title="অনলাইন পরীক্ষা ব্যবস্থা"
      description="শিক্ষার্থীদের জন্য ডিজিটাল প্রশ্নপত্রে অনলাইন পরীক্ষা গ্রহণ, টাইমার ও স্বয়ংক্রিয় রেজাল্ট শীট তৈরির সুবিধা।"
      iconName="globe"
      badgeText="উন্নয়ন চলছে"
    />
  )
}
