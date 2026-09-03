import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EssenceListPage } from "@/modules/essence/pages/essence-list-page"

export default async function EssencesPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.essence.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.essence.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <EssenceListPage />
    </HydrateClient>
  )
}
