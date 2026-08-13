import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { CitizensView } from "@/modules/citizen/ui/views/citizens-view"

export const metadata: Metadata = {
  title: "নাগরিক তালিকা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের সকল নিবন্ধিত নাগরিকের বিবরণ, প্রোফাইল সংশোধন ও অপসারণ পরিচালনা করুন।",
}

export default function CitizensPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নাগরিক তথ্য রেজিস্ট্রি"
        subtitle="ইউনিয়ন পরিষদের নিবন্ধিত সকল নাগরিকের তালিকা এবং প্রোফাইল ব্যবস্থাপনা"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <CitizensView />
      </main>
    </div>
  )
}
