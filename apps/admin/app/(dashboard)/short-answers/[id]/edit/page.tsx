import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditShortAnswerPage } from "@/modules/short-answer/pages/edit-short-answer-page"

export const metadata = {
  title: "Edit Short Answer | Shikhonary",
}

interface EditShortAnswerRouteProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditShortAnswerRoute({ params }: EditShortAnswerRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.shortAnswer.byId.queryOptions({ id })
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
      <EditShortAnswerPage id={id} />
    </HydrateClient>
  )
}
