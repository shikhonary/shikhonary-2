import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { GenerateTaxPaymentView } from "@/modules/generate-tax-payment/components/generate-tax-payment-view"

export const metadata: Metadata = {
  title: "বাৎসরিক কর জেনারেশন | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের নিবন্ধিত করদাতাদের জন্য অর্থবছরভিত্তিক স্বয়ংক্রিয় বাৎসরিক কর রসিদ তৈরি এবং কর নির্ধারণ",
}

export default function GenerateTaxPaymentPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="বাৎসরিক কর জেনারেশন ও ধার্য নির্ধারণ"
        subtitle="ইউনিয়ন পরিষদের নিবন্ধিত করদাতাদের জন্য অর্থবছরভিত্তিক স্বয়ংক্রিয় বাৎসরিক কর রসিদ তৈরি"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <GenerateTaxPaymentView />
      </main>
    </div>
  )
}
