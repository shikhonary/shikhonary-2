import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateFillInTheBlanksWithCluesPage } from "@/modules/fill-in-the-blanks-with-clues/pages/create-fill-in-the-blanks-with-clues-page"

export default async function CreateFillInTheBlanksWithCluesRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateFillInTheBlanksWithCluesPage />
    </HydrateClient>
  )
}
