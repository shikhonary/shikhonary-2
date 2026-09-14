import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditDescriptiveQuestionPage } from "@/modules/descriptive-question/pages/edit-descriptive-question-page"

interface EditDescriptiveQuestionRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditDescriptiveQuestionRoute({ params }: EditDescriptiveQuestionRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.descriptiveQuestion.byId.queryOptions({ id })
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
      <EditDescriptiveQuestionPage descriptiveQuestionId={id} />
    </HydrateClient>
  )
}
