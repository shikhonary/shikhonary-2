import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { FillInTheBlanksWithCluesListPage } from "@/modules/fill-in-the-blanks-with-clues/pages/fill-in-the-blanks-with-clues-list-page"

export default async function FillInTheBlanksWithCluesPage() {
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
    trpc.fillInTheBlanksWithClues.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.fillInTheBlanksWithClues.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <FillInTheBlanksWithCluesListPage />
    </HydrateClient>
  )
}
