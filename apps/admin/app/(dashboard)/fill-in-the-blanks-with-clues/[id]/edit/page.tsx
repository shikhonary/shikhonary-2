import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditFillInTheBlanksWithCluesPage } from "@/modules/fill-in-the-blanks-with-clues/pages/edit-fill-in-the-blanks-with-clues-page"

interface EditFillInTheBlanksWithCluesRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditFillInTheBlanksWithCluesRoute({ params }: EditFillInTheBlanksWithCluesRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.fillInTheBlanksWithClues.byId.queryOptions({ id })
  )
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <EditFillInTheBlanksWithCluesPage id={id} />
    </HydrateClient>
  )
}
