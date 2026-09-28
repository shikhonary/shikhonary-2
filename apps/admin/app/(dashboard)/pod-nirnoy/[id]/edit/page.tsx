import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditPodNirnoyPage } from "@/modules/pod-nirnoy/pages/edit-pod-nirnoy-page"

interface EditPodNirnoyRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditPodNirnoyRoute({ params }: EditPodNirnoyRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.podNirnoy.byId.queryOptions({ id })
  )

  return (
    <HydrateClient>
      <EditPodNirnoyPage id={id} />
    </HydrateClient>
  )
}
