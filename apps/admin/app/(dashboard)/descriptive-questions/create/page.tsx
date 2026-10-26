import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateDescriptiveQuestionPage } from "@/modules/descriptive-question/pages/create-descriptive-question-page"

export default async function CreateDescriptiveQuestionRoute() {
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
      <CreateDescriptiveQuestionPage />
    </HydrateClient>
  )
}
