import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListAcademicClassesInput } from "@workspace/api"

/**
 * Hook to list all academic classes with filtering & pagination.
 */
export function useAcademicClassesList(
  input: ListAcademicClassesInput = { limit: 50 }
) {
  return useQuery(trpc.academicClass.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for academic classes using suspense.
 */
export function useAcademicClassStats() {
  return useSuspenseQuery(trpc.academicClass.stats.queryOptions())
}

/**
 * Hook to fetch a single academic class by ID.
 */
export function useAcademicClassById(id: string, enabled = true) {
  return useQuery({
    ...trpc.academicClass.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch academic classes for dropdown selection.
 */
export function useAcademicClassesForSelection(isActive?: boolean) {
  return useQuery(trpc.academicClass.forSelection.queryOptions({ isActive }))
}

/**
 * Hook to create a new academic class record.
 */
export function useCreateAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}

/**
 * Hook to update an existing academic class record.
 */
export function useUpdateAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}

/**
 * Hook to delete an academic class record.
 */
export function useDeleteAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}
