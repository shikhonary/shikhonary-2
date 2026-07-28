import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { RoleListPage } from "@/modules/role/pages/role-list-page"

export default async function RolesRoute() {
  const queryClient = getQueryClient()
  // Prefetch the first page of roles
  void queryClient.prefetchQuery(trpc.role.list.queryOptions({ limit: 5 }))

  return (
    <HydrateClient>
      <RoleListPage />
    </HydrateClient>
  )
}
