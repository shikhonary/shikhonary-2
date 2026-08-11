import type { Metadata } from "next"
import { TaxPayerPrintView } from "@/modules/tax-payer/ui/views/tax-payer-print-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `করদাতা কর বিবরণী মুদ্রণ | ইউনিয়ন পরিষদ পোর্টাল`,
    description: `করদাতার হোল্ডিং কর ও আদায় বিবরণী মুদ্রণ কপি`,
  }
}

export default async function TaxPayerPrintPage({ params }: PageProps) {
  const { id } = await params
  return <TaxPayerPrintView taxPayerId={id} />
}
