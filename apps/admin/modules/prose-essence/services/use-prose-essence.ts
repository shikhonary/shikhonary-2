import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListProseEssenceInput,
  ProseEssenceStatsInput,
} from "@workspace/api"

export function useProseEssencesList(input: ListProseEssenceInput = { limit: 20 }) {
  return useQuery(trpc.proseEssence.list.queryOptions(input))
}

export function useProseEssenceStats(input?: ProseEssenceStatsInput) {
  return useQuery(trpc.proseEssence.stats.queryOptions(input))
}

export function useProseEssenceById(id: string, enabled = true) {
  return useQuery({
    ...trpc.proseEssence.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateProseEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.proseEssence.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.proseEssence.pathFilter())
    },
  })
}

export function useUpdateProseEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.proseEssence.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.proseEssence.pathFilter())
    },
  })
}

export function useDeleteProseEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.proseEssence.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.proseEssence.pathFilter())
    },
  })
}

export function useBulkDeleteProseEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.proseEssence.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.proseEssence.pathFilter())
    },
  })
}

export function useImportProseEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.proseEssence.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.proseEssence.pathFilter())
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
