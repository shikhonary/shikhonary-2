import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditFormFillingPage } from "@/modules/form-filling/pages/edit-form-filling-page"

interface EditFormFillingRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditFormFillingRoute({ params }: EditFormFillingRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.formFilling.byId.queryOptions({ id })
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
      <EditFormFillingPage id={id} />
    </HydrateClient>
  )
}
