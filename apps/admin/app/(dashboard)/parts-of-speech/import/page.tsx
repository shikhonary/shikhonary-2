import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { ImportPartsOfSpeechPage } from "@/modules/parts-of-speech/pages/import-parts-of-speech-page"

export default async function ImportPartsOfSpeechRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors
  void queryClient.prefetchQuery(
    trpc.academicClass.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.academicChapter.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <ImportPartsOfSpeechPage />
    </HydrateClient>
  )
}
