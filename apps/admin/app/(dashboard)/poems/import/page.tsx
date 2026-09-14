import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportPoemPage } from "@/modules/poem/pages/import-poem-page"

export default async function ImportPoemRoute() {
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
      <ImportPoemPage />
    </HydrateClient>
  )
}
