import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { SubjectQuestionTypesPage } from "@/modules/subject/pages/subject-question-types-page"

interface SubjectQuestionTypesRouteProps {
  params: Promise<{ id: string }>
}

export default async function SubjectQuestionTypesRoute({ params }: SubjectQuestionTypesRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(trpc.academicSubject.byId.queryOptions({ id }))
  void queryClient.prefetchQuery(trpc.questionType.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <SubjectQuestionTypesPage subjectId={id} />
    </HydrateClient>
  )
}
