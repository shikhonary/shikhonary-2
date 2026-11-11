import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateShortAnswerPage } from "@/modules/short-answer/pages/create-short-answer-page"

export const metadata = {
  title: "Create Short Answer | Shikhonary",
}

export default async function CreateShortAnswerRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors and question type templates
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateShortAnswerPage />
    </HydrateClient>
  )
}
