import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportNewsReportPage } from "@/modules/news-report/pages/import-news-report-page"

export default async function ImportNewsReportRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportNewsReportPage />
    </HydrateClient>
  )
}
