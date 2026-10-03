import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListShuddhoAshuddhoInput,
  ShuddhoAshuddhoStatsInput,
} from "@workspace/api"

export function useShuddhoAshuddhoList(input: ListShuddhoAshuddhoInput = { limit: 20 }) {
  return useQuery(trpc.shuddhoAshuddho.list.queryOptions(input))
}

export function useShuddhoAshuddhoStats(input?: ShuddhoAshuddhoStatsInput) {
  return useSuspenseQuery(trpc.shuddhoAshuddho.stats.queryOptions(input))
}

export function useShuddhoAshuddhoById(id: string, enabled = true) {
  return useQuery({
    ...trpc.shuddhoAshuddho.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateShuddhoAshuddho() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shuddhoAshuddho.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shuddhoAshuddho.pathFilter())
    },
  })
}

export function useUpdateShuddhoAshuddho() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shuddhoAshuddho.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shuddhoAshuddho.pathFilter())
    },
  })
}

export function useDeleteShuddhoAshuddho() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shuddhoAshuddho.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shuddhoAshuddho.pathFilter())
    },
  })
}

export function useBulkDeleteShuddhoAshuddho() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shuddhoAshuddho.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shuddhoAshuddho.pathFilter())
    },
  })
}

export function useImportShuddhoAshuddho() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shuddhoAshuddho.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shuddhoAshuddho.pathFilter())
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
