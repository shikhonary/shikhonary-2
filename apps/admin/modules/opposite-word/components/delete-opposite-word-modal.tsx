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
import { useDeleteOppositeWordModalStore } from "../store/use-delete-opposite-word-modal-store"
import { useDeleteOppositeWord, useBulkDeleteOppositeWord } from "../services/use-opposite-word"

interface DeleteOppositeWordModalProps {
  onSuccess?: () => void
}

export function DeleteOppositeWordModal({ onSuccess }: DeleteOppositeWordModalProps) {
  const { isOpen, oppositeWordId, wordText, selectedIds, closeModal } =
    useDeleteOppositeWordModalStore()

  const deleteSingle = useDeleteOppositeWord()
  const deleteBulk = useBulkDeleteOppositeWord()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Opposite Word items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Opposite Word items")
          },
        }
      )
    } else if (oppositeWordId) {
      deleteSingle.mutate(
        { id: oppositeWordId },
        {
          onSuccess: () => {
            toast.success("Opposite Word item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Opposite Word item")
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
            {isBulk ? "Delete Selected Opposite Word Items" : "Delete Opposite Word Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Opposite Word entries? This action cannot be undone.`
              : `Are you sure you want to delete "${wordText ?? "this Opposite Word entry"}"? This action cannot be undone.`}
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
