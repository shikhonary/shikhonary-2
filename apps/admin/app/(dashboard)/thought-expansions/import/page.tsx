import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportThoughtExpansionPage } from "@/modules/thought-expansion/pages/import-thought-expansion-page"

export default async function ImportThoughtExpansionRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportThoughtExpansionPage />
    </HydrateClient>
  )
}
