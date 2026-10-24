import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateRearrangePage } from "@/modules/rearrange/pages/create-rearrange-page"

export const metadata = {
  title: "Create Rearrange Question | Shikhonary",
}

export default async function Page() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateRearrangePage />
    </HydrateClient>
  )
}
