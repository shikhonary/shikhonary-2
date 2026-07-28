import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListRolesInput } from "@workspace/api"

/**
 * Hook to list all roles with filtering & pagination.
 */
export function useRolesList(
  input: ListRolesInput = { limit: 50 }
) {
  return useQuery(trpc.role.list.queryOptions(input))
}

/**
 * Hook to fetch a single role by ID.
 */
export function useRoleById(id: string, enabled = true) {
  return useQuery({
    ...trpc.role.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new role.
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.role.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.role.pathFilter())
    },
  })
}

/**
 * Hook to update an existing role.
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.role.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.role.pathFilter())
    },
  })
}

/**
 * Hook to delete a role.
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.role.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.role.pathFilter())
    },
  })
}
