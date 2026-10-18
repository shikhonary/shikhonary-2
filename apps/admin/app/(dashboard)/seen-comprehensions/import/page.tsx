import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportSeenComprehensionPage } from "@/modules/seen-comprehension/pages/import-seen-comprehension-page"

export default async function ImportSeenComprehensionRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportSeenComprehensionPage />
    </HydrateClient>
  )
}
