import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListCqsInput,
  CqStatsInput,
} from "@workspace/api"

/**
 * Hook to list CQs with filtering & pagination.
 */
export function useCqsList(input: ListCqsInput = { limit: 20 }) {
  return useQuery(trpc.cq.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for CQs using suspense.
 */
export function useCqStats(input?: CqStatsInput) {
  return useSuspenseQuery(trpc.cq.stats.queryOptions(input))
}

/**
 * Hook to fetch a single CQ by ID.
 */
export function useCqById(id: string, enabled = true) {
  return useQuery({
    ...trpc.cq.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new CQ record.
 */
export function useCreateCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to update an existing CQ record.
 */
export function useUpdateCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to delete a single CQ record.
 */
export function useDeleteCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete CQ records.
 */
export function useBulkDeleteCqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to toggle CQ active state.
 */
export function useToggleCqActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to bulk import CQ records.
 */
export function useImportCqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to fetch academic classes for select options list (returns array directly).
 */
export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list (returns array directly).
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
 * Hook to fetch academic chapters for dropdown select list (returns array directly).
 */
export function useChaptersForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.academicChapters ?? [],
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}
