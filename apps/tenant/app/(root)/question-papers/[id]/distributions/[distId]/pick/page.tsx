import type { Metadata } from "next"
import { DistributionPickerView } from "@/modules/question-paper-builder/ui/views/distribution-picker-view"

export const metadata: Metadata = {
  title: "প্রশ্ন নির্বাচন | শিখনারী পোর্টাল",
  description: "নম্বর বণ্টন অনুযায়ী প্রশ্ন নির্বাচন করুন",
}

interface PageProps {
  params: Promise<{ id: string; distId: string }>
}

export default async function DistributionPickerPage({ params }: PageProps) {
  const { id, distId } = await params

  return (
    <div className="w-full h-full min-h-screen">
      <DistributionPickerView paperId={id} distributionId={distId} />
    </div>
  )
}
