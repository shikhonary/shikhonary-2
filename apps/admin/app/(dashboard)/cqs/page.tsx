import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CqListPage } from "@/modules/cq/pages/cq-list-page"

export default async function CqsPage() {
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
    trpc.cq.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.cq.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <CqListPage />
    </HydrateClient>
  )
}
