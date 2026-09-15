import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListWordMeaningInput,
  WordMeaningStatsInput,
} from "@workspace/api"

export function useWordMeaningList(input: ListWordMeaningInput = { limit: 20 }) {
  return useQuery(trpc.wordMeaning.list.queryOptions(input))
}

export function useWordMeaningStats(input?: WordMeaningStatsInput) {
  return useSuspenseQuery(trpc.wordMeaning.stats.queryOptions(input))
}

export function useWordMeaningById(id: string, enabled = true) {
  return useQuery({
    ...trpc.wordMeaning.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateWordMeaning() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.wordMeaning.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.wordMeaning.pathFilter())
    },
  })
}

export function useUpdateWordMeaning() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.wordMeaning.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.wordMeaning.pathFilter())
    },
  })
}

export function useDeleteWordMeaning() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.wordMeaning.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.wordMeaning.pathFilter())
    },
  })
}

export function useBulkDeleteWordMeaning() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.wordMeaning.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.wordMeaning.pathFilter())
    },
  })
}

export function useImportWordMeaning() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.wordMeaning.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.wordMeaning.pathFilter())
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
