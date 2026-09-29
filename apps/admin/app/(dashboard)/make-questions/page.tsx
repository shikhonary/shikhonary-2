import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { MakeQuestionListPage } from "@/modules/make-question/pages/make-question-list-page"

export default async function MakeQuestionsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.makeQuestion.list.queryOptions({ limit: 20, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.makeQuestion.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <MakeQuestionListPage />
    </HydrateClient>
  )
}
