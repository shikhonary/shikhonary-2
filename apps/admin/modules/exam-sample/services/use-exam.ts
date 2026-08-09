import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListExamsInput, ExamStatsInput, McqsForAssignmentInput } from "@workspace/api"

/**
 * Hook to list all exams with filtering & pagination.
 */
export function useExamsList(input: ListExamsInput = { limit: 20 }) {
  return useQuery(trpc.exam.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for exams using suspense or query options.
 */
export function useExamStats(input?: ExamStatsInput) {
  return useQuery(trpc.exam.stats.queryOptions(input))
}

/**
 * Hook to fetch a single exam by ID.
 */
export function useExamById(id: string, enabled = true) {
  return useQuery({
    ...trpc.exam.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch MCQs for exam assignment with filtering & pagination.
 */
export function useExamMcqsForAssignment(input: McqsForAssignmentInput, enabled = true) {
  return useQuery({
    ...trpc.exam.mcqsForAssignment.queryOptions(input),
    enabled,
  })
}

/**
 * Hook to create a new exam record.
 */
export function useCreateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to update an existing exam record.
 */
export function useUpdateExam() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to delete an exam record.
 */
export function useDeleteExam() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete exams.
 */
export function useBulkDeleteExams() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to toggle/update an exam's status (Pending, Published, Archived).
 */
export function useToggleExamStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to add subjects to an existing exam.
 */
export function useAddExamSubjects() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.addSubjects.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to remove a subject link from an exam.
 */
export function useRemoveExamSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.removeSubject.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}

/**
 * Hook to update assigned MCQ IDs for an exam subject.
 */
export function useUpdateExamSubjectMcqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.exam.updateSubjectMcqs.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.exam.pathFilter())
    },
  })
}
