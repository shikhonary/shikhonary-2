import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { VerbTenseListPage } from "@/modules/verb-tense/pages/verb-tense-list-page"

export default async function VerbTensePage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.verbTense.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.verbTense.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <VerbTenseListPage />
    </HydrateClient>
  )
}
