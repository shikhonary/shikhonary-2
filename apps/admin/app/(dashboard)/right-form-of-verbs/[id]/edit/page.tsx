import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditRightFormOfVerbPage } from "@/modules/right-form-of-verb/pages/edit-right-form-of-verb-page"

interface EditRightFormOfVerbRouteProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditRightFormOfVerbRoute({ params }: EditRightFormOfVerbRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.rightFormOfVerb.byId.queryOptions({ id })
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
      <EditRightFormOfVerbPage id={id} />
    </HydrateClient>
  )
}
