import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CsListPage } from "@/modules/cs/pages/cs-list-page"

export default async function CsPage() {
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
    trpc.cs.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.cs.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <CsListPage />
    </HydrateClient>
  )
}
