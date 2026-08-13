import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { CountersView } from "@/modules/counter/ui/views/counters-view"

export const metadata: Metadata = {
  title: "কাউন্টার ব্যবস্থাপনা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের বিভিন্ন মডিউলের কাউন্টার ও রেকর্ড ট্র্যাকিং পরিচালনা",
}

export default function CountersPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="কাউন্টার ব্যবস্থাপনা"
        subtitle="ইউনিয়ন পরিষদের বিভিন্ন মডিউলের কাউন্টার ও রেকর্ড ট্র্যাকিং পরিচালনা"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <CountersView />
      </main>
    </div>
  )
}
