import type { Metadata } from "next";
import { DashboardOverview } from "@/modules/dashboard/ui/views/dashboard-overview";

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বাৎসরিক পরিকল্পনা ও ড্যাশবোর্ড ওভারভিউ",
};

export default function Page() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground text-sm">
          শিখনারী এডুকেশনাল পোর্টালে আপনাকে স্বাগতম।
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}
