import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListSynonymInput,
  SynonymStatsInput,
} from "@workspace/api"

export function useSynonymList(input: ListSynonymInput = { limit: 20 }) {
  return useQuery(trpc.synonym.list.queryOptions(input))
}

export function useSynonymStats(input?: SynonymStatsInput) {
  return useSuspenseQuery(trpc.synonym.stats.queryOptions(input))
}

export function useSynonymById(id: string, enabled = true) {
  return useQuery({
    ...trpc.synonym.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateSynonym() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.synonym.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.synonym.pathFilter())
    },
  })
}

export function useUpdateSynonym() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.synonym.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.synonym.pathFilter())
    },
  })
}

export function useDeleteSynonym() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.synonym.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.synonym.pathFilter())
    },
  })
}

export function useBulkDeleteSynonym() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.synonym.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.synonym.pathFilter())
    },
  })
}

export function useImportSynonym() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.synonym.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.synonym.pathFilter())
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
