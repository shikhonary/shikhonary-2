import { Metadata } from "next"
import { Suspense } from "react"
import { NewTenantView } from "@/modules/tenant/ui/views/new-tenant-view"

export const metadata: Metadata = {
  title: "নতুন প্রতিষ্ঠান তৈরি | সুপার অ্যাডমিন",
  description: "নতুন প্রতিষ্ঠান তৈরি, ক্লাউড ডেটাবেস প্রভিশন ও কনফিগারেশন",
}

export default function CreateTenantPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
        </div>
      }
    >
      <NewTenantView />
    </Suspense>
  )
}
