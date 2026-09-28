import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditVerbTensePage } from "@/modules/verb-tense/pages/edit-verb-tense-page"

interface EditVerbTenseRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditVerbTenseRoute({ params }: EditVerbTenseRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.verbTense.byId.queryOptions({ id })
  )

  return (
    <HydrateClient>
      <EditVerbTensePage id={id} />
    </HydrateClient>
  )
}
