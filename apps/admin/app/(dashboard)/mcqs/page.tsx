import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { McqListPage } from "@/modules/mcq/pages/mcq-list-page"

export default async function McqsPage() {
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
    trpc.mcq.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.mcq.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <McqListPage />
    </HydrateClient>
  )
}
