import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreatePoemPage } from "@/modules/poem/pages/create-poem-page"

export default async function CreatePoemRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors and question type templates
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
      <CreatePoemPage />
    </HydrateClient>
  )
}
