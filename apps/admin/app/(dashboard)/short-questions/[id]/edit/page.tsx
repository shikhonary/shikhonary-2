import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditShortQuestionPage } from "@/modules/short-question/pages/edit-short-question-page"

interface EditShortQuestionRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditShortQuestionRoute({ params }: EditShortQuestionRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.shortQuestion.byId.queryOptions({ id })
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
      <EditShortQuestionPage shortQuestionId={id} />
    </HydrateClient>
  )
}
