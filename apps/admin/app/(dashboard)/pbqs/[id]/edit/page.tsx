import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditPbqPage } from "@/modules/pbq/pages/edit-pbq-page"

interface EditPbqRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditPbqRoute({ params }: EditPbqRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.pbq.byId.queryOptions({ id })
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
      <EditPbqPage />
    </HydrateClient>
  )
}
