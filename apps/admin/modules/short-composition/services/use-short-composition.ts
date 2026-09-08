import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListShortCompositionInput,
  ShortCompositionStatsInput,
} from "@workspace/api"

/**
 * Hook to list Short Compositions with filtering & pagination.
 */
export function useShortCompositionsList(input: ListShortCompositionInput = { limit: 20 }) {
  return useQuery(trpc.shortComposition.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Short Compositions using suspense.
 */
export function useShortCompositionStats(input?: ShortCompositionStatsInput) {
  return useSuspenseQuery(trpc.shortComposition.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Short Composition by ID.
 */
export function useShortCompositionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.shortComposition.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Short Composition record.
 */
export function useCreateShortComposition() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortComposition.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortComposition.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Short Composition record.
 */
export function useUpdateShortComposition() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortComposition.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortComposition.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Short Composition record.
 */
export function useDeleteShortComposition() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortComposition.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortComposition.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Short Composition records.
 */
export function useBulkDeleteShortCompositions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortComposition.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortComposition.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Short Composition records.
 */
export function useImportShortCompositions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortComposition.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortComposition.pathFilter())
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
