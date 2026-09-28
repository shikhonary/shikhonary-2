import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPodNirnoyInput,
  PodNirnoyStatsInput,
} from "@workspace/api"

/**
 * Hook to list Pod Nirnoy entries with filtering & pagination.
 */
export function usePodNirnoysList(input: ListPodNirnoyInput = { limit: 20 }) {
  return useQuery(trpc.podNirnoy.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Pod Nirnoy using suspense.
 */
export function usePodNirnoyStats(input?: PodNirnoyStatsInput) {
  return useSuspenseQuery(trpc.podNirnoy.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Pod Nirnoy entry by ID.
 */
export function usePodNirnoyById(id: string, enabled = true) {
  return useQuery({
    ...trpc.podNirnoy.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Pod Nirnoy record.
 */
export function useCreatePodNirnoy() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.podNirnoy.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.podNirnoy.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Pod Nirnoy record.
 */
export function useUpdatePodNirnoy() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.podNirnoy.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.podNirnoy.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Pod Nirnoy record.
 */
export function useDeletePodNirnoy() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.podNirnoy.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.podNirnoy.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Pod Nirnoy records.
 */
export function useBulkDeletePodNirnoys() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.podNirnoy.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.podNirnoy.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Pod Nirnoy records.
 */
export function useImportPodNirnoys() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.podNirnoy.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.podNirnoy.pathFilter())
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
