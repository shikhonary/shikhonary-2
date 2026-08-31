import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { AmplificationListPage } from "@/modules/amplification/pages/amplification-list-page"

export default async function AmplificationsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.amplification.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.amplification.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <AmplificationListPage />
    </HydrateClient>
  )
}
