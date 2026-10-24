import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditRearrangePage } from "@/modules/rearrange/pages/edit-rearrange-page"

export const metadata = {
  title: "Edit Rearrange Question | Shikhonary",
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.rearrange.byId.queryOptions({ id })
  )

  return (
    <HydrateClient>
      <EditRearrangePage id={id} />
    </HydrateClient>
  )
}
