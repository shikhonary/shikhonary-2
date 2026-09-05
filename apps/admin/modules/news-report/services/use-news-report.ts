import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListNewsReportsInput,
  NewsReportStatsInput,
} from "@workspace/api"

/**
 * Hook to list News Reports with filtering & pagination.
 */
export function useNewsReportsList(input: ListNewsReportsInput = { limit: 20 }) {
  return useQuery(trpc.newsReport.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for News Reports using suspense.
 */
export function useNewsReportStats(input?: NewsReportStatsInput) {
  return useSuspenseQuery(trpc.newsReport.stats.queryOptions(input))
}

/**
 * Hook to fetch a single News Report by ID.
 */
export function useNewsReportById(id: string, enabled = true) {
  return useQuery({
    ...trpc.newsReport.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new News Report record.
 */
export function useCreateNewsReport() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.newsReport.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.newsReport.pathFilter())
    },
  })
}

/**
 * Hook to update an existing News Report record.
 */
export function useUpdateNewsReport() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.newsReport.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.newsReport.pathFilter())
    },
  })
}

/**
 * Hook to delete a single News Report record.
 */
export function useDeleteNewsReport() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.newsReport.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.newsReport.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete News Report records.
 */
export function useBulkDeleteNewsReports() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.newsReport.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.newsReport.pathFilter())
    },
  })
}

/**
 * Hook to bulk import News Report records.
 */
export function useImportNewsReports() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.newsReport.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.newsReport.pathFilter())
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
