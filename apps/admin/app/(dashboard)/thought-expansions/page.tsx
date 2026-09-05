import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ThoughtExpansionListPage } from "@/modules/thought-expansion/pages/thought-expansion-list-page"

export default async function ThoughtExpansionsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.thoughtExpansion.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.thoughtExpansion.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <ThoughtExpansionListPage />
    </HydrateClient>
  )
}
