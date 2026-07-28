import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListStudentsInput } from "@workspace/api"

/**
 * Hook to list all students with filtering & pagination.
 */
export function useStudentsList(input: ListStudentsInput) {
  return useQuery(trpc.student.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for students using suspense.
 */
export function useStudentStats() {
  return useSuspenseQuery(trpc.student.stats.queryOptions())
}

/**
 * Hook to fetch a single student by ID.
 */
export function useStudentById(id: string, enabled = true) {
  return useQuery({
    ...trpc.student.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new student record.
 */
export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.student.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.student.pathFilter())
    },
  })
}

/**
 * Hook to update an existing student record.
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.student.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.student.pathFilter())
    },
  })
}

/**
 * Hook to delete a student record.
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.student.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.student.pathFilter())
    },
  })
}
