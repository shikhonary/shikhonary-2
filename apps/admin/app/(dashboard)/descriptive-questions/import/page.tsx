import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportDescriptiveQuestionPage } from "@/modules/descriptive-question/pages/import-descriptive-question-page"

export default async function ImportDescriptiveQuestionRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportDescriptiveQuestionPage />
    </HydrateClient>
  )
}
