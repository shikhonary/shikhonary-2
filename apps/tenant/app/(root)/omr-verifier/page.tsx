import type { Metadata } from "next"
import { UnderDevelopmentView } from "@/components/under-development-view"

export const metadata: Metadata = {
  title: "ওএমআর ভেরিফায়ার | শিখনারী পোর্টাল",
  description: "মোবাইল ক্যামেরা বা স্ক্যানার দিয়ে ওএমআর শিট স্বয়ংক্রিয় মূল্যায়ন ও ফলাফল প্রস্তুতি",
}

export default function OmrVerifierPage() {
  return (
    <UnderDevelopmentView
      title="ওএমআর শিট ভেরিফায়ার"
      description="স্মার্টফোন ক্যামেরা বা সাধারণ স্ক্যানার দিয়ে শিক্ষার্থীদের নৈর্ব্যক্তিক ওএমআর উত্তরপত্র স্বয়ংক্রিয়ভাবে যাচাই করুন।"
      iconName="scan"
      badgeText="উন্নয়ন চলছে"
    />
  )
}
