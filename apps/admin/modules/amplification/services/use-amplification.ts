import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListAmplificationsInput,
  AmplificationStatsInput,
  CreateAmplificationInput,
  UpdateAmplificationInput,
  DeleteAmplificationInput,
  BulkDeleteAmplificationsInput,
  ImportAmplificationsInput,
} from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

// Hook to list all amplifications with filtering & pagination
export function useAmplificationsList(input: ListAmplificationsInput) {
  return useQuery(trpc.amplification.list.queryOptions(input))
}

// Hook to fetch amplification statistics counts
export function useAmplificationStats(input?: AmplificationStatsInput) {
  return useQuery(trpc.amplification.stats.queryOptions(input))
}

// Hook to fetch a single amplification by ID
export function useAmplificationById(id: string, enabled = true) {
  return useQuery({
    ...trpc.amplification.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

// Hook to create a new amplification
export function useCreateAmplification() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.amplification.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.amplification.pathFilter())
    },
  })
}

// Hook to update an existing amplification
export function useUpdateAmplification() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.amplification.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.amplification.pathFilter())
    },
  })
}

// Hook to delete a single amplification
export function useDeleteAmplification() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.amplification.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.amplification.pathFilter())
    },
  })
}

// Hook to bulk delete multiple amplifications
export function useBulkDeleteAmplifications() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.amplification.bulkDelete.mutationOptions(),
    onSuccess: (data) => {
      queryClient.invalidateQueries(trpc.amplification.pathFilter())
      toast.success(`Successfully deleted ${data.deletedCount} items.`)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to bulk delete items.")
    },
  })
}

// Hook to bulk import amplifications from JSON
export function useImportAmplifications() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.amplification.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.amplification.pathFilter())
    },
  })
}
