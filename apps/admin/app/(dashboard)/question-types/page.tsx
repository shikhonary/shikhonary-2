import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { QuestionTypeListPage } from "@/modules/question-type/pages/question-type-list-page"

export default async function QuestionTypesPage() {
  const queryClient = getQueryClient()
  // Prefetch question types list
  void queryClient.prefetchQuery(trpc.questionType.list.queryOptions({ limit: 20 }))

  return (
    <HydrateClient>
      <QuestionTypeListPage />
    </HydrateClient>
  )
}
