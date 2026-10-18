import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListNumberInWordsInput,
  NumberInWordsStatsInput,
} from "@workspace/api"

export function useNumberInWordsList(input: ListNumberInWordsInput = { limit: 20 }) {
  return useQuery(trpc.numberInWords.list.queryOptions(input))
}

export function useNumberInWordsStats(input?: NumberInWordsStatsInput) {
  return useSuspenseQuery(trpc.numberInWords.stats.queryOptions(input))
}

export function useNumberInWordsById(id: string, enabled = true) {
  return useQuery({
    ...trpc.numberInWords.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateNumberInWords() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
    },
  })
}

export function useUpdateNumberInWords() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
    },
  })
}

export function useToggleNumberInWordsActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
    },
  })
}

export function useDeleteNumberInWords() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
    },
  })
}

export function useBulkDeleteNumberInWords() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
    },
  })
}

export function useImportNumberInWords() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.numberInWords.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.numberInWords.pathFilter())
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
