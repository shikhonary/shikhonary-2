import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { NewsReportListPage } from "@/modules/news-report/pages/news-report-list-page"

export default async function NewsReportsPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.newsReport.list.queryOptions({ limit: 10, page: 1 })
  )
  void queryClient.prefetchQuery(
    trpc.newsReport.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <NewsReportListPage />
    </HydrateClient>
  )
}
