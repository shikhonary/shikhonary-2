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
import { useDeleteShuddhoAshuddhoModalStore } from "../store/use-delete-shuddho-ashuddho-modal-store"
import { useDeleteShuddhoAshuddho, useBulkDeleteShuddhoAshuddho } from "../services/use-shuddho-ashuddho"

interface DeleteShuddhoAshuddhoModalProps {
  onSuccess?: () => void
}

export function DeleteShuddhoAshuddhoModal({ onSuccess }: DeleteShuddhoAshuddhoModalProps) {
  const { isOpen, shuddhoAshuddhoId, sentenceText, selectedIds, closeModal } =
    useDeleteShuddhoAshuddhoModalStore()

  const deleteSingle = useDeleteShuddhoAshuddho()
  const deleteBulk = useBulkDeleteShuddhoAshuddho()

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
    } else if (shuddhoAshuddhoId) {
      deleteSingle.mutate(
        { id: shuddhoAshuddhoId },
        {
          onSuccess: () => {
            toast.success("Sentence question deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete sentence question")
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
            {isBulk ? "Delete Selected Sentence Questions" : "Delete Sentence Question"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected sentence questions? This action cannot be undone.`
              : `Are you sure you want to delete "${sentenceText ?? "this sentence question"}"? This action cannot be undone.`}
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
