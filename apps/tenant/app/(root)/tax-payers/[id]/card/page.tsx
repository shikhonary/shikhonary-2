import React from "react"
import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { TaxPayerCardViewPage } from "@/modules/tax-payer/components/tax-payer-card-view-page"

interface TaxPayerCardPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: TaxPayerCardPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `করদাতার হোল্ডিং স্মার্ট কার্ড | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `ডিজিটাল হোল্ডিং কর কার্ডের সম্মুখ ও পিছনের অংশ প্রদর্শন, প্রিন্ট এবং এইচডি ইমেজ ডাউনলোড`,
  }
}

export default async function TaxPayerCardPage({ params }: TaxPayerCardPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="হোল্ডিং স্মার্ট কার্ড"
        subtitle="করদাতার ডিজিটাল হোল্ডিং কার্ড ভিউ ও এইচডি কোয়ালিটি ইমেজ ডাউনলোড"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <TaxPayerCardViewPage taxPayerId={id} />
      </main>
    </div>
  )
}
