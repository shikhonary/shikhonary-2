import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListQuestionTypesInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list all question types with filtering & pagination.
 */
export function useQuestionTypesList(
  input: ListQuestionTypesInput = { limit: 20 }
) {
  return useQuery(trpc.questionType.list.queryOptions(input))
}

/**
 * Hook to fetch a single question type by ID.
 */
export function useQuestionTypeById(id: string, enabled = true) {
  return useQuery({
    ...trpc.questionType.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new question type.
 */
export function useCreateQuestionType() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.questionType.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionType.pathFilter())
    },
  })
}

/**
 * Hook to update an existing question type.
 */
export function useUpdateQuestionType() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.questionType.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionType.pathFilter())
    },
  })
}

/**
 * Hook to delete a question type.
 */
export function useDeleteQuestionType() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.questionType.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionType.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a question type.
 */
export function useToggleQuestionTypeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.questionType.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.questionType.pathFilter())
      toast.success("Question Type status updated.")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  })
}
