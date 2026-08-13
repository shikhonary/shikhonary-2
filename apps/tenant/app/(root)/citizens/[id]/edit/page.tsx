import React from "react"
import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { EditCitizenView } from "@/modules/citizen/ui/views/edit-citizen-view"

interface EditCitizenPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditCitizenPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `নাগরিক প্রোফাইল সংশোধন | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `নিবন্ধিত নাগরিকের তথ্য ও ঠিকানা সংশোধন সম্পন্ন করুন।`,
  }
}

export default async function EditCitizenPage({ params }: EditCitizenPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="নাগরিক তথ্য সংশোধন"
        subtitle="নিবন্ধিত নাগরিকের বিবরণ, ঠিকানা এবং অন্যান্য যোগাযোগের তথ্য সংশোধন করুন।"
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <EditCitizenView id={id} />
      </main>
    </div>
  )
}
