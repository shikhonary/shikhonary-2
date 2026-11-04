import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { TenantsView } from "@/modules/tenant/ui/views/tenants-view"

export default async function TenantsPage() {
  const queryClient = getQueryClient()

  // Prefetch tenants list and stats for instant SSR hydration
  void queryClient.prefetchQuery(trpc.tenant.list.queryOptions({ limit: 10 }))
  void queryClient.prefetchQuery(trpc.tenant.stats.queryOptions())

  return (
    <HydrateClient>
      <TenantsView />
    </HydrateClient>
  )
}
