import type { Metadata } from "next";
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header";
import { DashboardOverview } from "@/modules/dashboard/ui/views/dashboard-overview";

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের বাৎসরিক পরিকল্পনা, করদাতা ও রাজস্ব আদায় ড্যাশবোর্ড",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      <DashboardHeader title="ড্যাশবোর্ড" subtitle="ইউনিয়ন পরিষদ পোর্টালে আপনাকে স্বাগতম" />
      <DashboardOverview />
    </div>
  );
}
