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
import { useDeleteWordMeaningModalStore } from "../store/use-delete-word-meaning-modal-store"
import { useDeleteWordMeaning, useBulkDeleteWordMeaning } from "../services/use-word-meaning"

interface DeleteWordMeaningModalProps {
  onSuccess?: () => void
}

export function DeleteWordMeaningModal({ onSuccess }: DeleteWordMeaningModalProps) {
  const { isOpen, wordMeaningId, wordText, selectedIds, closeModal } =
    useDeleteWordMeaningModalStore()

  const deleteSingle = useDeleteWordMeaning()
  const deleteBulk = useBulkDeleteWordMeaning()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Word Meaning items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Word Meaning items")
          },
        }
      )
    } else if (wordMeaningId) {
      deleteSingle.mutate(
        { id: wordMeaningId },
        {
          onSuccess: () => {
            toast.success("Word Meaning item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Word Meaning item")
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
            {isBulk ? "Delete Selected Word Meaning Items" : "Delete Word Meaning Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Word Meaning entries? This action cannot be undone.`
              : `Are you sure you want to delete "${wordText ?? "this Word Meaning entry"}"? This action cannot be undone.`}
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
