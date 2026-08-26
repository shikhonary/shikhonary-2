import type { Metadata } from "next"
import { ProfileView } from "@/modules/profile/components/profile-view"

export const metadata: Metadata = {
  title: "প্রতিষ্ঠান প্রোফাইল | শিখনারী পোর্টাল",
  description: "প্রতিষ্ঠানের বিবরণ, কর্মকর্তাদের তথ্য এবং যোগাযোগের বিবরণ ব্যবস্থাপনা",
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5 lg:gap-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">প্রতিষ্ঠান প্রোফাইল</h1>
        <p className="text-muted-foreground text-sm">
          প্রতিষ্ঠানের বিবরণ, কর্মকর্তারা এবং যোগাযোগের বিবরণ আপডেট ও ব্যবস্থাপনা করুন।
        </p>
      </div>

      <div className="space-y-6">
        <ProfileView />
      </div>
    </div>
  )
}
