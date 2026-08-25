import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditQuestionTypePage } from "@/modules/question-type/pages/edit-question-type-page"

interface EditQuestionTypeRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionTypeRoute({ params }: EditQuestionTypeRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(trpc.questionType.byId.queryOptions({ id }))

  return (
    <HydrateClient>
      <EditQuestionTypePage questionTypeId={id} />
    </HydrateClient>
  )
}
