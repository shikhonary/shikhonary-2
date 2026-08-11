import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { FiscalYearsView } from "@/modules/fiscal-year/ui/views/fiscal-years-view"

export const metadata: Metadata = {
  title: "অর্থবছর ব্যবস্থাপনা | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের অর্থবছরসমূহ পরিচালনা, যোগ এবং কনফিগারেশন",
}

export default function FiscalYearsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="অর্থবছর ব্যবস্থাপনা"
        subtitle="ইউনিয়ন পরিষদের বাৎসরিক অর্থবছর পরিচালনা ও কনফিগারেশন"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        <FiscalYearsView />
      </main>
    </div>
  )
}

