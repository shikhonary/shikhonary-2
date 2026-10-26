import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ShortQuestionListPage } from "@/modules/short-question/pages/short-question-list-page"

export default async function ShortQuestionsPage() {
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
    trpc.shortQuestion.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.shortQuestion.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <ShortQuestionListPage />
    </HydrateClient>
  )
}
