import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { SeenComprehensionListPage } from "@/modules/seen-comprehension/pages/seen-comprehension-list-page"

export default async function SeenComprehensionsPage() {
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
    trpc.seenComprehension.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.seenComprehension.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <SeenComprehensionListPage />
    </HydrateClient>
  )
}
