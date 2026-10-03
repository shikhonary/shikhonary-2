import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditDanBamMilkoronPage } from "@/modules/dan-bam-milkoron/pages/edit-dan-bam-milkoron-page"

interface EditDanBamMilkoronRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditDanBamMilkoronRoute({ params }: EditDanBamMilkoronRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.danBamMilkoron.byId.queryOptions({ id })
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
      <EditDanBamMilkoronPage id={id} />
    </HydrateClient>
  )
}
