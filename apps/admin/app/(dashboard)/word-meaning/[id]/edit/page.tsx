import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditWordMeaningPage } from "@/modules/word-meaning/pages/edit-word-meaning-page"

interface EditWordMeaningRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditWordMeaningRoute({ params }: EditWordMeaningRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.wordMeaning.byId.queryOptions({ id })
  )
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
      <EditWordMeaningPage id={id} />
    </HydrateClient>
  )
}
