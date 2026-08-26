import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListMcqsInput,
  McqStatsInput,
} from "@workspace/api"

/**
 * Hook to list MCQs with filtering & pagination.
 */
export function useMcqsList(input: ListMcqsInput = { limit: 20 }) {
  return useQuery(trpc.mcq.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for MCQs using suspense.
 */
export function useMcqStats(input?: McqStatsInput) {
  return useSuspenseQuery(trpc.mcq.stats.queryOptions(input))
}

/**
 * Hook to fetch a single MCQ by ID.
 */
export function useMcqById(id: string, enabled = true) {
  return useQuery({
    ...trpc.mcq.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new MCQ record.
 */
export function useCreateMcq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
    },
  })
}

/**
 * Hook to update an existing MCQ record.
 */
export function useUpdateMcq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
    },
  })
}

/**
 * Hook to delete a single MCQ record.
 */
export function useDeleteMcq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete MCQ records.
 */
export function useBulkDeleteMcqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
    },
  })
}

/**
 * Hook to toggle MCQ active state.
 */
export function useToggleMcqActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
    },
  })
}

/**
 * Hook to bulk import MCQ records.
 */
export function useImportMcqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mcq.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mcq.pathFilter())
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
