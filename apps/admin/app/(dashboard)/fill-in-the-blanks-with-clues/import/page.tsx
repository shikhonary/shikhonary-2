import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportFillInTheBlanksWithCluesPage } from "@/modules/fill-in-the-blanks-with-clues/pages/import-fill-in-the-blanks-with-clues-page"

export default async function ImportFillInTheBlanksWithCluesRoute() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportFillInTheBlanksWithCluesPage />
    </HydrateClient>
  )
}
