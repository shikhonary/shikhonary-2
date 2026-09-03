import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListEssencesInput,
  EssenceStatsInput,
} from "@workspace/api"

/**
 * Hook to list Essences with filtering & pagination.
 */
export function useEssencesList(input: ListEssencesInput = { limit: 20 }) {
  return useQuery(trpc.essence.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Essences using suspense.
 */
export function useEssenceStats(input?: EssenceStatsInput) {
  return useSuspenseQuery(trpc.essence.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Essence by ID.
 */
export function useEssenceById(id: string, enabled = true) {
  return useQuery({
    ...trpc.essence.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Essence record.
 */
export function useCreateEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essence.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essence.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Essence record.
 */
export function useUpdateEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essence.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essence.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Essence record.
 */
export function useDeleteEssence() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essence.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essence.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Essence records.
 */
export function useBulkDeleteEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essence.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essence.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Essence records.
 */
export function useImportEssences() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.essence.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.essence.pathFilter())
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
