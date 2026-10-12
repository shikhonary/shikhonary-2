import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditGrammarQuestionPage } from "@/modules/grammar-question/pages/edit-grammar-question-page"

interface EditGrammarQuestionRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditGrammarQuestionRoute({ params }: EditGrammarQuestionRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.grammarQuestion.byId.queryOptions({ id })
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
      <EditGrammarQuestionPage grammarQuestionId={id} />
    </HydrateClient>
  )
}
