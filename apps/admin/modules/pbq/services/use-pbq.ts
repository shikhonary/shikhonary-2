import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListPbqsInput,
  PbqStatsInput,
} from "@workspace/api"

/**
 * Hook to list PBQs with filtering & pagination.
 */
export function usePbqsList(input: ListPbqsInput = { limit: 20 }) {
  return useQuery(trpc.pbq.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for PBQs using suspense.
 */
export function usePbqStats(input?: PbqStatsInput) {
  return useSuspenseQuery(trpc.pbq.stats.queryOptions(input))
}

/**
 * Hook to fetch a single PBQ by ID.
 */
export function usePbqById(id: string, enabled = true) {
  return useQuery({
    ...trpc.pbq.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch Board/Year references for filtering.
 */
export function usePbqBoardYears(input: { subjectId: string; chapterId?: string; academicChapterId?: string }) {
  return useQuery({
    ...trpc.pbq.boardYears.queryOptions(input),
    enabled: Boolean(input.subjectId),
  })
}

/**
 * Hook to create a new PBQ record.
 */
export function useCreatePbq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
    },
  })
}

/**
 * Hook to update an existing PBQ record.
 */
export function useUpdatePbq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
    },
  })
}

/**
 * Hook to delete a single PBQ record.
 */
export function useDeletePbq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete PBQ records.
 */
export function useBulkDeletePbqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
    },
  })
}

/**
 * Hook to toggle PBQ active state.
 */
export function useTogglePbqActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
    },
  })
}

/**
 * Hook to bulk import PBQ records.
 */
export function useImportPbqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.pbq.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.pbq.pathFilter())
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
