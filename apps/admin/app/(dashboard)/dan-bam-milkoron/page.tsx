import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { DanBamMilkoronListPage } from "@/modules/dan-bam-milkoron/pages/dan-bam-milkoron-list-page"

export default async function DanBamMilkoronPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.danBamMilkoron.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.danBamMilkoron.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <DanBamMilkoronListPage />
    </HydrateClient>
  )
}
