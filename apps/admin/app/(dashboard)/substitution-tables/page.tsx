import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { SubstitutionTablesListPage } from "@/modules/substitution-table/pages/substitution-tables-list-page"

export default async function SubstitutionTablesPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.substitutionTable.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.substitutionTable.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <SubstitutionTablesListPage />
    </HydrateClient>
  )
}
