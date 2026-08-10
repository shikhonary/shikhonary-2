import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { TaxPaymentListView } from "@/modules/tax-payment/components/tax-payment-list-view"

export const metadata: Metadata = {
  title: "কর আদায় রেজিস্টার | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের হোল্ডিং কর সংগ্রহের তালিকা, আদায়ের রসিদ রেজিস্টার এবং বাৎসরিক রাজস্ব আদায়ের হিসাবনিকাশ",
}

export default function TaxCollectionPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="হোল্ডিং কর আদায় ও রসিদ রেজিস্টার"
        subtitle="ইউনিয়ন পরিষদের বাৎসরিক কর সংগ্রহের রসিদ তৈরি, নথিভুক্তকরণ ও হিসাবনিকাশ"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <TaxPaymentListView />
      </main>
    </div>
  )
}
