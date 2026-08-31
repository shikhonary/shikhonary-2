import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportAmplificationPage } from "@/modules/amplification/pages/import-amplification-page"

export default async function ImportAmplificationRoute() {
  const queryClient = getQueryClient()

  // Prefetch lists
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportAmplificationPage />
    </HydrateClient>
  )
}
