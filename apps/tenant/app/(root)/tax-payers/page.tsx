import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { TaxPayersView } from "@/modules/tax-payer/ui/views/tax-payers-view"

export const metadata: Metadata = {
  title: "করদাতা তালিকা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের সকল হোল্ডিং করদাতাদের বিবরণ, ট্যাক্স প্রোফাইল এবং করের রেকর্ড ব্যবস্থাপনা",
}

export default function TaxPayersPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="করদাতা ব্যবস্থাপনা"
        subtitle="ইউনিয়ন পরিষদের হোল্ডিং করদাতাদের তালিকা, প্রোফাইল ও বাৎসরিক ট্যাক্স পরিচালনা"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <TaxPayersView />
      </main>
    </div>
  )
}

