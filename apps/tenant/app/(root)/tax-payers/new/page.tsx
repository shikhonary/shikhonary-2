import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { CreateTaxPayerView } from "@/modules/tax-payer/ui/views/create-tax-payer-view"

export const metadata: Metadata = {
  title: "নতুন করদাতা নিবন্ধন | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের নতুন হোল্ডিং করদাতার বিবরণ, ঠিকানা, হোল্ডিং নম্বর ও করের হার সহ নিবন্ধনের ফর্ম",
}

export default function NewTaxPayerPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নতুন করদাতা নিবন্ধন"
        subtitle="ইউনিয়ন পরিষদের নতুন হোল্ডিং করদাতার তথ্য নথিভুক্ত করুন"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <CreateTaxPayerView />
      </main>
    </div>
  )
}

