import React from "react"
import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { CitizenApplicationDetailView } from "@/modules/citizen-application/ui/views/citizen-application-detail-view"

interface CitizenApplicationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: CitizenApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `নাগরিক আবেদনের বিস্তারিত বিবরণী | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `নতুন নাগরিক আবেদন বিবরণী, পরিচয় যাচাইকরণ ও অনুমোদন পরিচালনা করুন`,
  }
}

export default async function CitizenApplicationDetailPage({ params }: CitizenApplicationDetailPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নাগরিক আবেদনপত্র বিবরণী"
        subtitle="ইউনিয়ন পরিষদের নতুন নাগরিক আবেদনের বিস্তারিত প্রোফাইল, ঠিকানা এবং অনুমোদন বা প্রত্যাখ্যান পরিচালনা করুন।"
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <CitizenApplicationDetailView applicationId={id} />
      </main>
    </div>
  )
}
