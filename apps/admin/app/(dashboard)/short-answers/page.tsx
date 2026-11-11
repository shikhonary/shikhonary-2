import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ShortAnswerListPage } from "@/modules/short-answer/pages/short-answer-list-page"

export const metadata = {
  title: "Short Answer Questions | Shikhonary",
}

export default async function ShortAnswersPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries matching MCQ
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
    trpc.shortAnswer.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.shortAnswer.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <ShortAnswerListPage />
    </HydrateClient>
  )
}
