import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { EditNumberInWordsPage } from "@/modules/number-in-words/pages/edit-number-in-words-page"

interface EditNumberInWordsRouteProps {
  params: Promise<{ id: string }>
}

export default async function EditNumberInWordsRoute({ params }: EditNumberInWordsRouteProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(
    trpc.numberInWords.byId.queryOptions({ id })
  )
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
      <EditNumberInWordsPage id={id} />
    </HydrateClient>
  )
}
