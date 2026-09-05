import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListEssaysInput,
  EssayStatsInput,
} from "@workspace/api"

/**
 * Hook to list Essays with filtering & pagination.
 */
export function useEssaysList(input: ListEssaysInput = { limit: 20 }) {
  return useQuery(trpc.essay.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Essays using suspense.
 */
export function useEssayStats(input?: EssayStatsInput) {
  return useSuspenseQuery(trpc.essay.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Essay by ID.
 */
export function useEssayById(id: string, enabled = true) {
  return useQuery({
    ...trpc.essay.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Essay record.
 */
export function useCreateEssay() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essay.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essay.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Essay record.
 */
export function useUpdateEssay() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essay.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essay.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Essay record.
 */
export function useDeleteEssay() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essay.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essay.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Essay records.
 */
export function useBulkDeleteEssays() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essay.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essay.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Essay records.
 */
export function useImportEssays() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essay.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essay.pathFilter())
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
