import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPoemsInput,
  PoemStatsInput,
} from "@workspace/api"

/**
 * Hook to list Poems with filtering & pagination.
 */
export function usePoemsList(input: ListPoemsInput = { limit: 20 }) {
  return useQuery(trpc.poem.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Poems using suspense.
 */
export function usePoemStats(input?: PoemStatsInput) {
  return useSuspenseQuery(trpc.poem.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Poem by ID.
 */
export function usePoemById(id: string, enabled = true) {
  return useQuery({
    ...trpc.poem.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Poem record.
 */
export function useCreatePoem() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poem.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poem.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Poem record.
 */
export function useUpdatePoem() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poem.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poem.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Poem record.
 */
export function useDeletePoem() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poem.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poem.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Poem records.
 */
export function useBulkDeletePoems() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poem.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poem.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Poem records.
 */
export function useImportPoems() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.poem.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.poem.pathFilter())
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
