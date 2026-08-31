import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateAmplificationPage } from "@/modules/amplification/pages/create-amplification-page"

export default async function CreateAmplificationRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateAmplificationPage />
    </HydrateClient>
  )
}
