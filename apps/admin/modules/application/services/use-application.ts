import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListApplicationsInput,
  ApplicationStatsInput,
} from "@workspace/api"

/**
 * Hook to list Applications with filtering & pagination.
 */
export function useApplicationsList(input: ListApplicationsInput = { limit: 20 }) {
  return useQuery(trpc.application.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Applications using suspense.
 */
export function useApplicationStats(input?: ApplicationStatsInput) {
  return useSuspenseQuery(trpc.application.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Application by ID.
 */
export function useApplicationById(id: string, enabled = true) {
  return useQuery({
    ...trpc.application.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Application record.
 */
export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.application.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.application.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Application record.
 */
export function useUpdateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.application.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.application.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Application record.
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.application.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.application.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Application records.
 */
export function useBulkDeleteApplications() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.application.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.application.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Application records.
 */
export function useImportApplications() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.application.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.application.pathFilter())
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
