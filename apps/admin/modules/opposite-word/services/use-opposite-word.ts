import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListOppositeWordInput,
  OppositeWordStatsInput,
} from "@workspace/api"

export function useOppositeWordList(input: ListOppositeWordInput = { limit: 20 }) {
  return useQuery(trpc.oppositeWord.list.queryOptions(input))
}

export function useOppositeWordStats(input?: OppositeWordStatsInput) {
  return useSuspenseQuery(trpc.oppositeWord.stats.queryOptions(input))
}

export function useOppositeWordById(id: string, enabled = true) {
  return useQuery({
    ...trpc.oppositeWord.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateOppositeWord() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.oppositeWord.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.oppositeWord.pathFilter())
    },
  })
}

export function useUpdateOppositeWord() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.oppositeWord.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.oppositeWord.pathFilter())
    },
  })
}

export function useDeleteOppositeWord() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.oppositeWord.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.oppositeWord.pathFilter())
    },
  })
}

export function useBulkDeleteOppositeWord() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.oppositeWord.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.oppositeWord.pathFilter())
    },
  })
}

export function useImportOppositeWord() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.oppositeWord.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.oppositeWord.pathFilter())
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
