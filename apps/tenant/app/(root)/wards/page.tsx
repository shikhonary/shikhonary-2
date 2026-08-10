import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { WardListView } from "@/modules/ward/components/ward-list-view"

export const metadata: Metadata = {
  title: "ওয়ার্ড ব্যবস্থাপনা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের বাৎসরিক ওয়ার্ড তালিকা, নতুন ওয়ার্ড নিবন্ধন এবং ওয়ার্ডভিত্তিক করদাতার বিবরণ পরিচালনা",
}

export default function WardsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="ওয়ার্ড ব্যবস্থাপনা"
        subtitle="ইউনিয়ন পরিষদের বাৎসরিক ওয়ার্ড সংকলন ও পরিচালনা"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <WardListView />
      </main>
    </div>
  )
}
