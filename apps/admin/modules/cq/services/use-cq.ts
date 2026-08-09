import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListCqsInput,
} from "@workspace/api"

/**
 * Hook to list CQs with filtering & pagination.
 */
export function useCqsList(input: ListCqsInput = { limit: 20 }) {
  return useQuery(trpc.cq.list.queryOptions(input))
}

/**
 * Hook to fetch a single CQ by ID.
 */
export function useCqById(id: string, enabled = true) {
  return useQuery({
    ...trpc.cq.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new CQ record.
 */
export function useCreateCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to update an existing CQ record.
 */
export function useUpdateCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to delete a single CQ record.
 */
export function useDeleteCq() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete CQ records.
 */
export function useBulkDeleteCqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}

/**
 * Hook to bulk import CQ records from JSON.
 */
export function useImportCqs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.cq.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.cq.pathFilter())
    },
  })
}
