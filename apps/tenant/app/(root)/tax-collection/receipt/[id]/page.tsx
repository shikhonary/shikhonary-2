import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { TaxReceiptPrintView } from "@/modules/tax-payment/ui/views/tax-receipt-print-view"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `কর আদায় রসিদ পত্র | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `ইউনিয়ন পরিষদের অফিশিয়াল বাৎসরিক কর সংগ্রহের রসিদ ও চালানের বিবরণ এবং প্রিন্ট কপি`,
  }
}

export default async function TaxReceiptPrintPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen print:min-h-0 print:bg-white">
      <div className="no-print print:hidden">
        <DashboardHeader
          title="হোল্ডিং কর আদায় রসিদ পত্র"
          subtitle="ইউনিয়ন পরিষদের অফিসিয়াল বাৎসরিক কর সংগ্রহের রসিদ ও চালানের প্রিন্ট ভিউ"
        />
      </div>
      <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto print:p-0 print:m-0 print:max-w-none">
        <TaxReceiptPrintView paymentId={id} />
      </main>
    </div>
  )
}
