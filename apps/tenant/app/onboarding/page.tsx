import { Metadata } from "next"
import { Suspense } from "react"
import { TenantOnboardingView } from "@/modules/onboarding/ui/views/tenant-onboarding-view"

export const metadata: Metadata = {
  title: "প্রতিষ্ঠান নিবন্ধন | শিখনারী পোর্টাল",
  description: "আপনার শিক্ষা প্রতিষ্ঠান বা কোচিং সেন্টারের তথ্য নিবন্ধন করুন।",
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <TenantOnboardingView />
    </Suspense>
  )
}
