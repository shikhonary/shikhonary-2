import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListSummariesInput,
  SummaryStatsInput,
} from "@workspace/api"

/**
 * Hook to list Summaries with filtering & pagination.
 */
export function useSummariesList(input: ListSummariesInput = { limit: 20 }) {
  return useQuery(trpc.summary.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Summaries using suspense.
 */
export function useSummaryStats(input?: SummaryStatsInput) {
  return useSuspenseQuery(trpc.summary.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Summary by ID.
 */
export function useSummaryById(id: string, enabled = true) {
  return useQuery({
    ...trpc.summary.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Summary record.
 */
export function useCreateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.summary.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.summary.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Summary record.
 */
export function useUpdateSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.summary.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.summary.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Summary record.
 */
export function useDeleteSummary() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.summary.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.summary.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Summary records.
 */
export function useBulkDeleteSummaries() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.summary.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.summary.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Summary records.
 */
export function useImportSummaries() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.summary.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.summary.pathFilter())
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
