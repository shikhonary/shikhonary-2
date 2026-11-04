import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { SubjectManagementPage } from "@/modules/subject/pages/subject-management-page"

export default async function SubjectsPage() {
  const queryClient = getQueryClient()

  // Prefetch subjects, stats, classes and academic years lists
  void queryClient.prefetchQuery(trpc.academicSubject.list.queryOptions({ limit: 10 }))
  void queryClient.prefetchQuery(trpc.academicSubject.stats.queryOptions({}))
  void queryClient.prefetchQuery(trpc.academicClass.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <SubjectManagementPage />
    </HydrateClient>
  )
}
