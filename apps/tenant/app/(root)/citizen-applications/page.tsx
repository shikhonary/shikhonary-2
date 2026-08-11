import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { CitizenApplicationsView } from "@/modules/citizen-application/ui/views/citizen-applications-view"

export const metadata: Metadata = {
  title: "নাগরিক আবেদন তালিকা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের সকল নাগরিক আবেদনের বিবরণ, অনুমোদন এবং প্রত্যাখ্যাত আবেদনসমূহ ব্যবস্থাপনা",
}

export default function CitizenApplicationsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নাগরিক আবেদন ব্যবস্থাপনা"
        subtitle="ইউনিয়ন পরিষদের নতুন নাগরিক আবেদনের তালিকা, প্রোফাইল যাচাইকরণ ও অনুমোদন পরিচালনা"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <CitizenApplicationsView />
      </main>
    </div>
  )
}
