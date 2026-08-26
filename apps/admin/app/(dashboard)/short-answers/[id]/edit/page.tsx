import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditShortAnswerPage } from "@/modules/short-answer/pages/edit-short-answer-page"

export const metadata = {
  title: "Edit Short Answer | Shikhonary",
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
    trpc.shortAnswer.byId.queryOptions({ id })
  )

  return (
    <HydrateClient>
      <EditShortAnswerPage id={id} />
    </HydrateClient>
  )
}
