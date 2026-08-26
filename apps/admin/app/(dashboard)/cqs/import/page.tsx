import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportCqPage } from "@/modules/cq/pages/import-cq-page"

export default async function ImportCqRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportCqPage />
    </HydrateClient>
  )
}
