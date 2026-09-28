import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { PodNirnoyListPage } from "@/modules/pod-nirnoy/pages/pod-nirnoy-list-page"

export default async function PodNirnoyPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.podNirnoy.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.podNirnoy.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <PodNirnoyListPage />
    </HydrateClient>
  )
}
