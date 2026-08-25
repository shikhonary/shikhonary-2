import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { AcademicClassListPage } from "@/modules/academic-class/pages/academic-class-list-page"

export default async function AcademicClassesPage() {
  const queryClient = getQueryClient()
  // Prefetch academic classes list
  void queryClient.prefetchQuery(trpc.academicClass.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <AcademicClassListPage />
    </HydrateClient>
  )
}
