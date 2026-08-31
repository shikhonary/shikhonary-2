import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ParagraphListPage } from "@/modules/paragraph/pages/paragraph-list-page"

export default async function ParagraphsPage() {
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
    trpc.paragraph.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.paragraph.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <ParagraphListPage />
    </HydrateClient>
  )
}
