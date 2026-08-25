import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateChapterPage } from "@/modules/chapter/pages/create-chapter-page"

export default async function CreateChapterRoute() {
  const queryClient = getQueryClient()
  
  // Prefetch options lists
  void queryClient.prefetchQuery(trpc.academicSubject.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <CreateChapterPage />
    </HydrateClient>
  )
}
