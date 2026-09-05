import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditThoughtExpansionPage } from "@/modules/thought-expansion/pages/edit-thought-expansion-page"

interface EditThoughtExpansionRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditThoughtExpansionRoute({ params }: EditThoughtExpansionRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.thoughtExpansion.byId.queryOptions({ id })
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
      <EditThoughtExpansionPage />
    </HydrateClient>
  )
}
