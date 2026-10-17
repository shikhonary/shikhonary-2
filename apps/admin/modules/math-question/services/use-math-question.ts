import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListMathQuestionInput,
  MathQuestionStatsInput,
} from "@workspace/api"

export function useMathQuestionsList(input: ListMathQuestionInput = { limit: 20 }) {
  return useQuery(trpc.mathQuestion.list.queryOptions(input))
}

export function useMathQuestionStats(input?: MathQuestionStatsInput) {
  return useSuspenseQuery(trpc.mathQuestion.stats.queryOptions(input))
}

export function useMathQuestionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.mathQuestion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateMathQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mathQuestion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mathQuestion.pathFilter())
    },
  })
}

export function useUpdateMathQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mathQuestion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mathQuestion.pathFilter())
    },
  })
}

export function useDeleteMathQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mathQuestion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mathQuestion.pathFilter())
    },
  })
}

export function useBulkDeleteMathQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mathQuestion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mathQuestion.pathFilter())
    },
  })
}

export function useImportMathQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.mathQuestion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.mathQuestion.pathFilter())
    },
  })
}

export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

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
