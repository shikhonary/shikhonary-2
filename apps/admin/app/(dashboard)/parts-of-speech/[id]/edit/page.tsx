import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditPartsOfSpeechPage } from "@/modules/parts-of-speech/pages/edit-parts-of-speech-page"

interface EditPartsOfSpeechRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditPartsOfSpeechRoute({ params }: EditPartsOfSpeechRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  // Prefetch details, classes, subjects, and question type templates
  void queryClient.prefetchQuery(
    trpc.partsOfSpeech.byId.queryOptions({ id })
  )
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
      <EditPartsOfSpeechPage id={id} />
    </HydrateClient>
  )
}
