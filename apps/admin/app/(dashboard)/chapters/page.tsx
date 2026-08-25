import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ChapterManagementPage } from "@/modules/chapter/pages/chapter-management-page"

export default async function ChaptersPage() {
  const queryClient = getQueryClient()

  // Prefetch lists
  void queryClient.prefetchQuery(trpc.academicChapter.list.queryOptions({ limit: 10 }))
  void queryClient.prefetchQuery(trpc.academicSubject.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <ChapterManagementPage />
    </HydrateClient>
  )
}
