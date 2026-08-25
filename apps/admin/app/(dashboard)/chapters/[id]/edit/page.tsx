import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditChapterPage } from "@/modules/chapter/pages/edit-chapter-page"

interface EditChapterRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditChapterRoute({ params }: EditChapterRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details and selector lists
  void queryClient.prefetchQuery(trpc.academicChapter.byId.queryOptions({ id }))
  void queryClient.prefetchQuery(trpc.academicSubject.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <EditChapterPage chapterId={id} />
    </HydrateClient>
  )
}
