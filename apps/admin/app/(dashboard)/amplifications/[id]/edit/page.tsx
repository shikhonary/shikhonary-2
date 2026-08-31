import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditAmplificationPage } from "@/modules/amplification/pages/edit-amplification-page"

interface EditAmplificationRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditAmplificationRoute({ params }: EditAmplificationRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects
  void queryClient.prefetchQuery(
    trpc.amplification.byId.queryOptions({ id })
  )
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <EditAmplificationPage />
    </HydrateClient>
  )
}
