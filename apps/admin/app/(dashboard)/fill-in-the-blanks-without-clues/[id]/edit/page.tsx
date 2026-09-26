import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditFillInTheBlanksWithoutCluesPage } from "@/modules/fill-in-the-blanks-without-clues/pages/edit-fill-in-the-blanks-without-clues-page"

interface EditFillInTheBlanksWithoutCluesRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditFillInTheBlanksWithoutCluesRoute({ params }: EditFillInTheBlanksWithoutCluesRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.fillInTheBlanksWithoutClues.byId.queryOptions({ id })
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
      <EditFillInTheBlanksWithoutCluesPage id={id} />
    </HydrateClient>
  )
}
