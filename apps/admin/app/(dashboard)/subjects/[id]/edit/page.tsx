import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditSubjectPage } from "@/modules/subject/pages/edit-subject-page"

interface EditSubjectRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditSubjectRoute({ params }: EditSubjectRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(trpc.academicSubject.byId.queryOptions({ id }))
  void queryClient.prefetchQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))
  void queryClient.prefetchQuery(trpc.academicClass.list.queryOptions({ limit: 100 }))

  return (
    <HydrateClient>
      <EditSubjectPage subjectId={id} />
    </HydrateClient>
  )
}
