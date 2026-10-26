import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { DescriptiveQuestionListPage } from "@/modules/descriptive-question/pages/descriptive-question-list-page"

export default async function DescriptiveQuestionsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.descriptiveQuestion.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.descriptiveQuestion.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <DescriptiveQuestionListPage />
    </HydrateClient>
  )
}
