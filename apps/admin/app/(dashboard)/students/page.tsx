import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { StudentListPage } from "@/modules/student/pages/student-list-page"

export default async function StudentsRoute() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.student.stats.queryOptions())

  return (
    <HydrateClient>
      <StudentListPage />
    </HydrateClient>
  )
}
