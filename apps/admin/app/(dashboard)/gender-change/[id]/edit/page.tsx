import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditGenderChangePage } from "@/modules/gender-change/pages/edit-gender-change-page"

interface EditGenderChangeRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditGenderChangeRoute({ params }: EditGenderChangeRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.genderChange.byId.queryOptions({ id })
  )
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <EditGenderChangePage id={id} />
    </HydrateClient>
  )
}
