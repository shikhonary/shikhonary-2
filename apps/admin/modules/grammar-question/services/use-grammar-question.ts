import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListGrammarQuestionInput,
  GrammarQuestionStatsInput,
} from "@workspace/api"

export function useGrammarQuestionsList(input: ListGrammarQuestionInput = { limit: 20 }) {
  return useQuery(trpc.grammarQuestion.list.queryOptions(input))
}

export function useGrammarQuestionStats(input?: GrammarQuestionStatsInput) {
  return useSuspenseQuery(trpc.grammarQuestion.stats.queryOptions(input))
}

export function useGrammarQuestionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.grammarQuestion.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateGrammarQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.grammarQuestion.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.grammarQuestion.pathFilter())
    },
  })
}

export function useUpdateGrammarQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.grammarQuestion.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.grammarQuestion.pathFilter())
    },
  })
}

export function useDeleteGrammarQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.grammarQuestion.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.grammarQuestion.pathFilter())
    },
  })
}

export function useBulkDeleteGrammarQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.grammarQuestion.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.grammarQuestion.pathFilter())
    },
  })
}

export function useImportGrammarQuestions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.grammarQuestion.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.grammarQuestion.pathFilter())
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
