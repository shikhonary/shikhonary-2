import { trpc, HydrateClient } from "@/trpc/server"
import { getQueryClient } from "@/trpc/query-client"
import { RearrangeListPage } from "@/modules/rearrange/pages/rearrange-list-page"

export const metadata = {
  title: "Rearrange Questions | Shikhonary",
}

interface PageProps {
  searchParams: Promise<{
    query?: string
    subjectId?: string
    chapterId?: string
    difficulty?: string
    board?: string
    sort?: string
    page?: string
    limit?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 10

  let boardSource: string | undefined = undefined
  let boardYear: number | undefined = undefined
  if (params.board && params.board !== "All") {
    const parts = params.board.split("-")
    const yearPart = parts[parts.length - 1]
    const sourcePart = parts.slice(0, parts.length - 1).join("-")
    if (sourcePart && yearPart && !isNaN(Number(yearPart))) {
      boardSource = sourcePart
      boardYear = Number(yearPart)
    } else {
      boardSource = params.board
    }
  }

  const queryClient = getQueryClient()

  // Prefetch data
  void queryClient.prefetchQuery(
    trpc.academicSubject.list.queryOptions({ limit: 100 })
  )
  void queryClient.prefetchQuery(
    trpc.rearrange.list.queryOptions({
      page,
      limit,
      query: params.query || undefined,
      subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
      chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
      difficulty: params.difficulty !== "All" ? (params.difficulty as any) : undefined,
      source: boardSource,
      year: boardYear,
      sort: params.sort as any,
    })
  )
  void queryClient.prefetchQuery(
    trpc.rearrange.stats.queryOptions({
      subjectId: params.subjectId !== "All" ? params.subjectId : undefined,
      chapterId: params.chapterId !== "All" ? params.chapterId : undefined,
    })
  )

  return (
    <HydrateClient>
      <RearrangeListPage />
    </HydrateClient>
  )
}
