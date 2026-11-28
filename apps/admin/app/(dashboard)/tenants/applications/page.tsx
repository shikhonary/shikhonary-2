import { Metadata } from "next"
import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { TenantApplicationsView } from "@/modules/tenant/ui/components/tenant-applications-view"

export const metadata: Metadata = {
  title: "অনবোর্ডিং আবেদনসমূহ | সুপার অ্যাডমিন",
  description: "নতুন প্রতিষ্ঠান অনবোর্ডিং আবেদন পর্যালোচনা ও ডেটাবেজ প্রভিশন",
}

export default async function TenantApplicationsPage() {
  const queryClient = getQueryClient()

  // Prefetch initial applications list and stats
  void queryClient.prefetchQuery(trpc.tenantApplication.list.queryOptions({ limit: 10 }))
  void queryClient.prefetchQuery(trpc.tenantApplication.stats.queryOptions())

  return (
    <HydrateClient>
      <TenantApplicationsView />
    </HydrateClient>
  )
}
