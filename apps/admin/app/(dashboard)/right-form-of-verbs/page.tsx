import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { RightFormOfVerbListPage } from "@/modules/right-form-of-verb/pages/right-form-of-verb-list-page"

export default async function RightFormOfVerbsPage() {
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
    trpc.rightFormOfVerb.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.rightFormOfVerb.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <RightFormOfVerbListPage />
    </HydrateClient>
  )
}
