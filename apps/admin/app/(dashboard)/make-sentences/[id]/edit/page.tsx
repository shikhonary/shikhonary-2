import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditMakeSentencesPage } from "@/modules/make-sentences/pages/edit-make-sentences-page"

interface EditMakeSentencesRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditMakeSentencesRoute({ params }: EditMakeSentencesRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.makeSentences.byId.queryOptions({ id })
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
      <EditMakeSentencesPage id={id} />
    </HydrateClient>
  )
}
