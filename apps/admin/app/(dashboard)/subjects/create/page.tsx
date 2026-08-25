import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateSubjectPage } from "@/modules/subject/pages/create-subject-page"

export default async function CreateSubjectRoute() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicClass.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <CreateSubjectPage />
    </HydrateClient>
  )
}
