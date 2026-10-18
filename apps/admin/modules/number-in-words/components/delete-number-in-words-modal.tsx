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
import { useDeleteNumberInWordsModalStore } from "../store/use-delete-number-in-words-modal-store"
import { useDeleteNumberInWords, useBulkDeleteNumberInWords } from "../services/use-number-in-words"

interface DeleteNumberInWordsModalProps {
  onSuccess?: () => void
}

export function DeleteNumberInWordsModal({ onSuccess }: DeleteNumberInWordsModalProps) {
  const { isOpen, numberInWordsId, itemText, selectedIds, closeModal } =
    useDeleteNumberInWordsModalStore()

  const deleteSingle = useDeleteNumberInWords()
  const deleteBulk = useBulkDeleteNumberInWords()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Number in Words items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Number in Words items")
          },
        }
      )
    } else if (numberInWordsId) {
      deleteSingle.mutate(
        { id: numberInWordsId },
        {
          onSuccess: () => {
            toast.success("Number in Words item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Number in Words item")
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
            {isBulk ? "Delete Selected Number in Words Items" : "Delete Number in Words Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Number in Words entries? This action cannot be undone.`
              : `Are you sure you want to delete "${itemText ?? "this Number in Words entry"}"? This action cannot be undone.`}
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
