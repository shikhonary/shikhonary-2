import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditMcqPage } from "@/modules/mcq/pages/edit-mcq-page"

interface EditMcqRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditMcqRoute({ params }: EditMcqRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.mcq.byId.queryOptions({ id })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <EditMcqPage id={id} />
    </HydrateClient>
  )
}
