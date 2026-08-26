import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportShortAnswerPage } from "@/modules/short-answer/pages/import-short-answer-page"

export const metadata = {
  title: "Import Short Answers | Shikhonary",
}

export default async function Page() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportShortAnswerPage />
    </HydrateClient>
  )
}
