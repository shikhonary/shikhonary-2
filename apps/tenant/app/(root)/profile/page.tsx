import type { Metadata } from "next"
import { ProfileView } from "@/modules/profile/components/profile-view"

export const metadata: Metadata = {
  title: "প্রতিষ্ঠান প্রোফাইল ও সেটিংস | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বিবরণ, অ্যাকাডেমিক তথ্য, কর্মকর্তা ও ডিজিটাল স্বাক্ষর ব্যবস্থাপনা",
}

export default function ProfilePage() {
  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <ProfileView />
    </div>
  )
}
