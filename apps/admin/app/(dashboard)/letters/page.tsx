import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { LetterListPage } from "@/modules/letter/pages/letter-list-page"

export default async function LettersPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.letter.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.letter.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <LetterListPage />
    </HydrateClient>
  )
}
