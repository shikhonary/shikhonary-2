import type { Metadata } from "next"
import DashboardHeader from "@/modules/layout/ui/layout/dashboard-header"
import { ProfileView } from "@/modules/profile/components/profile-view"

export const metadata: Metadata = {
  title: "ইউনিয়ন প্রোফাইল | ইউনিয়ন পরিষদ পোর্টাল",
  description: "ইউনিয়ন পরিষদের বিবরণ, ভৌগোলিক সীমানা, কর্মকর্তাদের তথ্য এবং যোগাযোগের বিবরণ ব্যবস্থাপনা",
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="ইউনিয়ন প্রোফাইল"
        subtitle="ইউনিয়ন পরিষদের বিবরণ, ভৌগোলিক তথ্য এবং কর্মকর্তাদের প্রোফাইল আপডেট করুন"
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
        <ProfileView />
      </main>
    </div>
  )
}
