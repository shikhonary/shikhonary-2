import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPoemEssenceInput,
  PoemEssenceStatsInput,
} from "@workspace/api"

export function usePoemEssencesList(input: ListPoemEssenceInput = { limit: 20 }) {
  return useQuery(trpc.poemEssence.list.queryOptions(input))
}

export function usePoemEssenceStats(input?: PoemEssenceStatsInput) {
  return useQuery(trpc.poemEssence.stats.queryOptions(input))
}

export function usePoemEssenceById(id: string, enabled = true) {
  return useQuery({
    ...trpc.poemEssence.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreatePoemEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poemEssence.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poemEssence.pathFilter())
    },
  })
}

export function useUpdatePoemEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poemEssence.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poemEssence.pathFilter())
    },
  })
}

export function useDeletePoemEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poemEssence.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poemEssence.pathFilter())
    },
  })
}

export function useBulkDeletePoemEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poemEssence.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poemEssence.pathFilter())
    },
  })
}

export function useImportPoemEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poemEssence.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poemEssence.pathFilter())
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
