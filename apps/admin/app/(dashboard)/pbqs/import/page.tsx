import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportPbqPage } from "@/modules/pbq/pages/import-pbq-page"

export default async function ImportPbqRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportPbqPage />
    </HydrateClient>
  )
}
