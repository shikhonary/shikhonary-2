import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListShortQuestionsInput,
  ShortQuestionStatsInput,
} from "@workspace/api"

export function useShortQuestionsList(input: ListShortQuestionsInput = { limit: 20 }) {
  return useQuery(trpc.shortQuestion.list.queryOptions(input))
}

export function useShortQuestionStats(input?: ShortQuestionStatsInput) {
  return useSuspenseQuery(trpc.shortQuestion.stats.queryOptions(input))
}

export function useShortQuestionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.shortQuestion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateShortQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortQuestion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortQuestion.pathFilter())
    },
  })
}

export function useUpdateShortQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortQuestion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortQuestion.pathFilter())
    },
  })
}

export function useDeleteShortQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortQuestion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortQuestion.pathFilter())
    },
  })
}

export function useBulkDeleteShortQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortQuestion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortQuestion.pathFilter())
    },
  })
}

export function useImportShortQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.shortQuestion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.shortQuestion.pathFilter())
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
