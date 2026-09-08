import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditSubstitutionTablePage } from "@/modules/substitution-table/pages/edit-substitution-table-page"

interface EditSubstitutionTableRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditSubstitutionTableRoute({ params }: EditSubstitutionTableRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.substitutionTable.byId.queryOptions({ id })
  )
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <EditSubstitutionTablePage id={id} />
    </HydrateClient>
  )
}
