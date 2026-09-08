import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPunctuationInput,
  PunctuationStatsInput,
} from "@workspace/api"

/**
 * Hook to list Punctuation questions with filtering & pagination.
 */
export function usePunctuationList(input: ListPunctuationInput = { limit: 20 }) {
  return useQuery(trpc.punctuation.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Punctuation using suspense.
 */
export function usePunctuationStats(input?: PunctuationStatsInput) {
  return useSuspenseQuery(trpc.punctuation.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Punctuation by ID.
 */
export function usePunctuationById(id: string, enabled = true) {
  return useQuery({
    ...trpc.punctuation.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Punctuation record.
 */
export function useCreatePunctuation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.punctuation.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.punctuation.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Punctuation record.
 */
export function useUpdatePunctuation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.punctuation.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.punctuation.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Punctuation record.
 */
export function useDeletePunctuation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.punctuation.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.punctuation.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Punctuation records.
 */
export function useBulkDeletePunctuation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.punctuation.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.punctuation.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Punctuation records.
 */
export function useImportPunctuation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.punctuation.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.punctuation.pathFilter())
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
