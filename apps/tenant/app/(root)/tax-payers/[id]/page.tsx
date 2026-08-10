import React from "react"
import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { TaxPayerDetailView } from "@/modules/tax-payer/components/tax-payer-detail-view"

interface TaxPayerDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: TaxPayerDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `করদাতার বিস্তারিত প্রোফাইল | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `হোল্ডিং করদাতার প্রোফাইল বিবরণ, বাৎসরিক কর নির্ধারণ এবং পরিশোধের ইতিহাস`,
  }
}

export default async function TaxPayerDetailPage({ params }: TaxPayerDetailPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="করদাতার প্রোফাইল ও বিবরণী"
        subtitle="হোল্ডিং করদাতার বিস্তারিত প্রোফাইল, পরিশোধের ইতিহাস ও ডিজিটাল স্মার্ট কার্ড"
      />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <TaxPayerDetailView taxPayerId={id} />
      </main>
    </div>
  )
}
