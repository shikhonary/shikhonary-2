import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { NewCitizenApplicationView } from "@/modules/citizen-application/ui/views/new-citizen-application-view"

export const metadata: Metadata = {
  title: "নতুন নাগরিক আবেদন | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের নতুন নাগরিক আবেদন নিবন্ধন করুন",
}

export default function NewCitizenApplicationPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নতুন নাগরিক আবেদন"
        subtitle="ইউনিয়ন পরিষদের নতুন নাগরিক আবেদনপত্রের তথ্য দাখিল করুন"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <NewCitizenApplicationView />
      </main>
    </div>
  )
}
