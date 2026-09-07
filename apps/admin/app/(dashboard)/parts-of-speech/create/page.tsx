import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { CreatePartsOfSpeechPage } from "@/modules/parts-of-speech/pages/create-parts-of-speech-page"

export default async function CreatePartsOfSpeechRoute() {
  const queryClient = getQueryClient()

  // Prefetch selectors and question type templates
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.questionType.list.queryOptions({ limit: 100 })
  )

  return (
    <HydrateClient>
      <CreatePartsOfSpeechPage />
    </HydrateClient>
  )
}
