import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { FillInTheBlanksWithoutCluesListPage } from "@/modules/fill-in-the-blanks-without-clues/pages/fill-in-the-blanks-without-clues-list-page"

export default async function FillInTheBlanksWithoutCluesPage() {
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
    trpc.fillInTheBlanksWithoutClues.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.fillInTheBlanksWithoutClues.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <FillInTheBlanksWithoutCluesListPage />
    </HydrateClient>
  )
}
