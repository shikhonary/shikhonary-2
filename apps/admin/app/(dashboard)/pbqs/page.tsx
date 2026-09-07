import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { PbqListPage } from "@/modules/pbq/pages/pbq-list-page"

export default async function PbqsPage() {
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
    trpc.pbq.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.pbq.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <PbqListPage />
    </HydrateClient>
  )
}
