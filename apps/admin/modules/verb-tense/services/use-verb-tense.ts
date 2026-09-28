import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListVerbTenseInput,
  VerbTenseStatsInput,
} from "@workspace/api"

/**
 * Hook to list Verb Tense entries with filtering & pagination.
 */
export function useVerbTensesList(input: ListVerbTenseInput = { limit: 20 }) {
  return useQuery(trpc.verbTense.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Verb Tense using suspense.
 */
export function useVerbTenseStats(input?: VerbTenseStatsInput) {
  return useSuspenseQuery(trpc.verbTense.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Verb Tense entry by ID.
 */
export function useVerbTenseById(id: string, enabled = true) {
  return useQuery({
    ...trpc.verbTense.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Verb Tense record.
 */
export function useCreateVerbTense() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.verbTense.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.verbTense.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Verb Tense record.
 */
export function useUpdateVerbTense() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.verbTense.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.verbTense.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Verb Tense record.
 */
export function useDeleteVerbTense() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.verbTense.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.verbTense.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Verb Tense records.
 */
export function useBulkDeleteVerbTenses() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.verbTense.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.verbTense.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Verb Tense records.
 */
export function useImportVerbTenses() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.verbTense.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.verbTense.pathFilter())
    },
  })
}

/**
 * Hook to fetch academic classes for select options list.
 */
export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list.
 */
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

/**
 * Hook to fetch academic chapters for dropdown select list.
 */
export function useChaptersForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.academicChapters ?? [],
    enabled: Boolean(subjectId),
  })
}
