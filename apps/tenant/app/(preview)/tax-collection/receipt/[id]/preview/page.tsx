import type { Metadata } from "next"
import { TaxReceiptPrintView } from "@/modules/tax-payment/ui/views/tax-receipt-print-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `কর আদায় রসিদ মুদ্রণ | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `করদাতার হোল্ডিং কর পরিশোধের অফিশিয়াল রসিদ মুদ্রণ কপি`,
  }
}

export default async function TaxReceiptPrintPage({ params }: PageProps) {
  const { id } = await params
  return <TaxReceiptPrintView paymentId={id} />
}
