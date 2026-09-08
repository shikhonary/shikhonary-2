import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ShortCompositionListPage } from "@/modules/short-composition/pages/short-composition-list-page"

export default async function ShortCompositionPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.shortComposition.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.shortComposition.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <ShortCompositionListPage />
    </HydrateClient>
  )
}
