import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditCsPage } from "@/modules/cs/pages/edit-cs-page"

interface EditCsRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditCsRoute({ params }: EditCsRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.cs.byId.queryOptions({ id })
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
      <EditCsPage id={id} />
    </HydrateClient>
  )
}
