import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { SubscriptionPlanListPage } from "@/modules/subscription-plan/pages/subscription-plan-list-page"

export default async function SubscriptionPlansPage() {
  const queryClient = getQueryClient()
  // Prefetch subscription plans list
  void queryClient.prefetchQuery(trpc.subscriptionPlan.list.queryOptions({ limit: 50 }))

  return (
    <HydrateClient>
      <SubscriptionPlanListPage />
    </HydrateClient>
  )
}
