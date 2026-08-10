import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { EditTaxPayerView } from "@/modules/tax-payer/components/edit-tax-payer-view"

interface EditTaxPayerPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditTaxPayerPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `করদাতার তথ্য সম্পাদনা | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `নিবন্ধিত করদাতার ব্যক্তিগত বিবরণ, হোল্ডিং নম্বর, গ্রাম, ওয়ার্ড এবং করের তথ্য হালনাগাদ করার ফর্ম`,
  }
}

export default async function EditTaxPayerPage({ params }: EditTaxPayerPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="করদাতার তথ্য সম্পাদনা"
        subtitle="নিবন্ধিত করদাতার নাম, হোল্ডিং ও ট্যাক্সের পরিমাণ হালনাগাদ করুন"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <EditTaxPayerView taxPayerId={id} />
      </main>
    </div>
  )
}
