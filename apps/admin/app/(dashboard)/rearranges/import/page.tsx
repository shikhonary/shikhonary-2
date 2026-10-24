import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportRearrangePage } from "@/modules/rearrange/pages/import-rearrange-page"

export const metadata = {
  title: "Import Rearrange Questions | Shikhonary",
}

export default async function Page() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportRearrangePage />
    </HydrateClient>
  )
}
