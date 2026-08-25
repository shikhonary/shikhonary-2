import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { AcademicYearListPage } from "@/modules/academic-year/pages/academic-year-list-page"

export default async function AcademicYearsPage() {
  const queryClient = getQueryClient()
  // Prefetch academic years list
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <AcademicYearListPage />
    </HydrateClient>
  )
}
