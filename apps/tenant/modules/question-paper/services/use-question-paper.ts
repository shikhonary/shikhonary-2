import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { QuestionTypeCode } from "@workspace/utils"
import type {
  ListQuestionPapersInput,
  GetQuestionPaperInput,
  CreateQuestionPaperInput,
  UpdateQuestionPaperInput,
  DeleteQuestionPaperInput,
  DuplicateQuestionPaperInput,
  AddQuestionPaperQuestionInput,
  RemoveQuestionPaperQuestionInput,
  ReorderQuestionPaperQuestionsInput,
  UpsertQuestionPaperSectionInput,
  DeleteQuestionPaperSectionInput,
  UpsertQuestionPaperSubjectInput,
  DeleteQuestionPaperSubjectInput,
  UpsertQuestionPaperDistributionInput,
  DeleteQuestionPaperDistributionInput,
} from "@workspace/api"

export function useQuestionPapersList(input: ListQuestionPapersInput = { limit: 10 }) {
  return useQuery(trpc.questionPaper.list.queryOptions(input))
}

export function useQuestionPaperById(id: string, enabled = true) {
  return useQuery({
    ...trpc.questionPaper.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useQuestionPaperHistory(id: string, enabled = true) {
  return useQuery({
    ...trpc.questionPaper.history.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.list.queryFilter())
    },
  })
}

export function useCreateQuestionPaperFull() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.createFull.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.list.queryFilter())
    },
  })
}

export function useUpdateQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.update.mutationOptions(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDeleteQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDuplicateQuestionPaper() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.duplicate.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useAddQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.addQuestion.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useRemoveQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.removeQuestion.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useReorderQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.reorderQuestions.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpsertSection() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.upsertSection.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDeleteSection() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.deleteSection.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpsertSubSection() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.upsertSubSection.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDeleteSubSection() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.deleteSubSection.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpsertSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.upsertSubject.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.deleteSubject.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpsertDistribution() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.upsertDistribution.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useDeleteDistribution() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.deleteDistribution.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

// ---------------------------------------------------------------------------
// Builder Specific Hooks
// ---------------------------------------------------------------------------

export function useQuestionPaperDistributionStatuses(paperId: string, enabled = true) {
  return useQuery({
    ...trpc.questionPaper.getDistributionStatuses.queryOptions({ questionPaperId: paperId }),
    enabled: Boolean(paperId) && enabled,
    refetchOnWindowFocus: false,
  })
}

export function useAvailableQuestions(
  input: {
    subjectId: string
    chapterId?: string
    questionTypeId?: string
    category?: QuestionTypeCode
    difficulty?: string
    search?: string
    board?: string
    year?: number
    excludePaperId?: string
    limit?: number
    cursor?: string
  },
  enabled = true
) {
  return useQuery({
    ...trpc.questionPaper.getAvailableQuestions.queryOptions(input),
    enabled: Boolean(input.subjectId) && enabled,
    refetchOnWindowFocus: false,
  })
}

export function useBulkAssignQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.bulkAssignQuestions.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useBulkRemoveQuestions() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.bulkRemoveQuestions.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpdateQuestionPaperSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.updateSettings.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useGeneratePaperSets() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.generateSets.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useAddAlternativeQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.addAlternative.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useRemoveAlternativeQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.removeAlternative.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useSwapAlternativeQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.swapAlternative.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

export function useUpdateAlternativeQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.questionPaper.updateAlternative.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionPaper.pathFilter())
    },
  })
}

