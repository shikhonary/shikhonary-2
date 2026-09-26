import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditOppositeWordPage } from "@/modules/opposite-word/pages/edit-opposite-word-page"

interface EditOppositeWordRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditOppositeWordRoute({ params }: EditOppositeWordRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.oppositeWord.byId.queryOptions({ id })
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
      <EditOppositeWordPage id={id} />
    </HydrateClient>
  )
}
