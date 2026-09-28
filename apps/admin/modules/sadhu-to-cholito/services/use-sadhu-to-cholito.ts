import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListSadhuToCholitoInput,
  SadhuToCholitoStatsInput,
} from "@workspace/api"

export function useSadhuToCholitoList(input: ListSadhuToCholitoInput = { limit: 20 }) {
  return useQuery(trpc.sadhuToCholito.list.queryOptions(input))
}

export function useSadhuToCholitoStats(input?: SadhuToCholitoStatsInput) {
  return useSuspenseQuery(trpc.sadhuToCholito.stats.queryOptions(input))
}

export function useSadhuToCholitoById(id: string, enabled = true) {
  return useQuery({
    ...trpc.sadhuToCholito.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateSadhuToCholito() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.sadhuToCholito.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.sadhuToCholito.pathFilter())
    },
  })
}

export function useUpdateSadhuToCholito() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.sadhuToCholito.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.sadhuToCholito.pathFilter())
    },
  })
}

export function useDeleteSadhuToCholito() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.sadhuToCholito.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.sadhuToCholito.pathFilter())
    },
  })
}

export function useBulkDeleteSadhuToCholito() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.sadhuToCholito.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.sadhuToCholito.pathFilter())
    },
  })
}

export function useImportSadhuToCholito() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.sadhuToCholito.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.sadhuToCholito.pathFilter())
    },
  })
}

export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

export function useSubjectsForSelection(input?: { academicClassId?: string }) {
  const classId = input?.academicClassId === "All" ? undefined : input?.academicClassId
  return useQuery({
    ...trpc.academicSubject.list.queryOptions({
      limit: 100,
      classId,
    }),
    select: (data) => data.academicSubjects ?? [],
  })
}

export function useChaptersForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.academicChapters ?? [],
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}
