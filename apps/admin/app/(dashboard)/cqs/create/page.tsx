import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateCqPage } from "@/modules/cq/pages/create-cq-page"

export default async function CreateCqRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors and question type templates
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateCqPage />
    </HydrateClient>
  )
}
