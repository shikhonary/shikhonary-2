import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreatePbqPage } from "@/modules/pbq/pages/create-pbq-page"

export default async function CreatePbqRoute() {
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
      <CreatePbqPage />
    </HydrateClient>
  )
}
