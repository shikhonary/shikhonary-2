"use client"

import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { useDeleteSadhuToCholitoModalStore } from "../store/use-delete-sadhu-to-cholito-modal-store"
import { useDeleteSadhuToCholito, useBulkDeleteSadhuToCholito } from "../services/use-sadhu-to-cholito"

interface DeleteSadhuToCholitoModalProps {
  onSuccess?: () => void
}

export function DeleteSadhuToCholitoModal({ onSuccess }: DeleteSadhuToCholitoModalProps) {
  const { isOpen, sadhuToCholitoId, sadhuText, selectedIds, closeModal } =
    useDeleteSadhuToCholitoModalStore()

  const deleteSingle = useDeleteSadhuToCholito()
  const deleteBulk = useBulkDeleteSadhuToCholito()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected items")
          },
        }
      )
    } else if (sadhuToCholitoId) {
      deleteSingle.mutate(
        { id: sadhuToCholitoId },
        {
          onSuccess: () => {
            toast.success("Item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete item")
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? "Delete Selected Sadhu to Cholito Items" : "Delete Sadhu to Cholito Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected entries? This action cannot be undone.`
              : `Are you sure you want to delete "${sadhuText ?? "this entry"}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={closeModal} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
