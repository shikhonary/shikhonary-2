import type { Metadata } from "next"
import { ResourcePricingView } from "@/modules/subscription-plan/ui/views/resource-pricing-view"

export const metadata: Metadata = {
  title: "রিসোর্স ও প্রশ্ন টাইপ ক্রেডিট মূল্যতালিকা | শিখনারী পোর্টাল",
  description: "প্রশ্নব্যাংক ও এআই প্রশ্ন তৈরির প্রশ্ন প্রকারভিত্তিক ক্রেডিট রেট এবং প্রশ্নপত্রের আনুমানিক ক্রেডিট হিসাব করুন",
}

export default function ResourcePricingPage() {
  return <ResourcePricingView />
}
