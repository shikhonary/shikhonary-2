import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { PoemListPage } from "@/modules/poem/pages/poem-list-page"

export default async function PoemsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.poem.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.poem.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <PoemListPage />
    </HydrateClient>
  )
}
