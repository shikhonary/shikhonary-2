import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListShortAnswersInput,
  ShortAnswerStatsInput,
} from "@workspace/api"

/**
 * Hook to list Short Answers with filtering & pagination.
 */
export function useShortAnswersList(input: ListShortAnswersInput = { limit: 20 }) {
  return useQuery(trpc.shortAnswer.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Short Answers using suspense.
 */
export function useShortAnswerStats(input?: ShortAnswerStatsInput) {
  return useSuspenseQuery(trpc.shortAnswer.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Short Answer by ID.
 */
export function useShortAnswerById(id: string, enabled = true) {
  return useQuery({
    ...trpc.shortAnswer.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Short Answer record.
 */
export function useCreateShortAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Short Answer record.
 */
export function useUpdateShortAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Short Answer record.
 */
export function useDeleteShortAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Short Answer records.
 */
export function useBulkDeleteShortAnswers() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to toggle Short Answer active state.
 */
export function useToggleShortAnswerActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Short Answer records.
 */
export function useImportShortAnswers() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to resolve a Short Answer report.
 */
export function useResolveShortAnswerReport() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.resolveReport.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
    },
  })
}

/**
 * Hook to assign a Short Answer report to a user.
 */
export function useAssignShortAnswerReport() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortAnswer.assignReport.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortAnswer.pathFilter())
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
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}
