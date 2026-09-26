import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportFillInTheBlanksWithoutCluesPage } from "@/modules/fill-in-the-blanks-without-clues/pages/import-fill-in-the-blanks-without-clues-page"

export default async function ImportFillInTheBlanksWithoutCluesRoute() {
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
      <ImportFillInTheBlanksWithoutCluesPage />
    </HydrateClient>
  )
}
