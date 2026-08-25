import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { FiscalYearListPage } from "@/modules/fiscal-year/pages/fiscal-year-list-page"

export default async function FiscalYearsPage() {
  const queryClient = getQueryClient()
  // Prefetch fiscal years list
  void queryClient.prefetchQuery(trpc.fiscalYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <FiscalYearListPage />
    </HydrateClient>
  )
}
