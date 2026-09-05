import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListThoughtExpansionsInput,
  ThoughtExpansionStatsInput,
} from "@workspace/api"

/**
 * Hook to list Thought Expansions with filtering & pagination.
 */
export function useThoughtExpansionsList(input: ListThoughtExpansionsInput = { limit: 20 }) {
  return useQuery(trpc.thoughtExpansion.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Thought Expansions using suspense.
 */
export function useThoughtExpansionStats(input?: ThoughtExpansionStatsInput) {
  return useSuspenseQuery(trpc.thoughtExpansion.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Thought Expansion by ID.
 */
export function useThoughtExpansionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.thoughtExpansion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Thought Expansion record.
 */
export function useCreateThoughtExpansion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.thoughtExpansion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.thoughtExpansion.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Thought Expansion record.
 */
export function useUpdateThoughtExpansion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.thoughtExpansion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.thoughtExpansion.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Thought Expansion record.
 */
export function useDeleteThoughtExpansion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.thoughtExpansion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.thoughtExpansion.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Thought Expansion records.
 */
export function useBulkDeleteThoughtExpansions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.thoughtExpansion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.thoughtExpansion.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Thought Expansion records.
 */
export function useImportThoughtExpansions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.thoughtExpansion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.thoughtExpansion.pathFilter())
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
