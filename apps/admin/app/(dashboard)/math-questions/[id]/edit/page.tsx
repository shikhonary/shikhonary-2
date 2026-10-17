import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditMathQuestionPage } from "@/modules/math-question/pages/edit-math-question-page"

interface EditMathQuestionRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditMathQuestionRoute({ params }: EditMathQuestionRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.mathQuestion.byId.queryOptions({ id })
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
      <EditMathQuestionPage mathQuestionId={id} />
    </HydrateClient>
  )
}
