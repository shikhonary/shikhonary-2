import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreateShortAnswerPage } from "@/modules/short-answer/pages/create-short-answer-page"

export const metadata = {
  title: "Create Short Answer | Shikhonary",
}

export default async function Page() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreateShortAnswerPage />
    </HydrateClient>
  )
}
