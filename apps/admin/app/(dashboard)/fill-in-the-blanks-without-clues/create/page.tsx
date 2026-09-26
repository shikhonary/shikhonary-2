import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateFillInTheBlanksWithoutCluesPage } from "@/modules/fill-in-the-blanks-without-clues/pages/create-fill-in-the-blanks-without-clues-page"

export default async function CreateFillInTheBlanksWithoutCluesRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateFillInTheBlanksWithoutCluesPage />
    </HydrateClient>
  )
}
