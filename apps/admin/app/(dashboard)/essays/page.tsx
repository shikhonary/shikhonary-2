import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EssayListPage } from "@/modules/essay/pages/essay-list-page"

export default async function EssaysPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.essay.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.essay.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <EssayListPage />
    </HydrateClient>
  )
}
