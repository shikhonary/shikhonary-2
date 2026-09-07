import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { PartsOfSpeechListPage } from "@/modules/parts-of-speech/pages/parts-of-speech-list-page"

export default async function PartsOfSpeechPage() {
  const queryClient = getQueryClient()

  // Prefetch selectors and list queries
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.partsOfSpeech.list.queryOptions({ limit: 10 })
  )
  void queryClient.prefetchQuery(
    trpc.partsOfSpeech.stats.queryOptions()
  )

  return (
    <HydrateClient>
      <PartsOfSpeechListPage />
    </HydrateClient>
  )
}
