import type { Metadata } from "next";
import { DashboardOverview } from "@/modules/dashboard/ui/views/dashboard-overview";

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বাৎসরিক পরিকল্পনা ও ড্যাশবোর্ড ওভারভিউ",
};

export default function Page() {
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      <DashboardOverview />
    </div>
  );
}
