"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteRearrangeModalStore } from "../store/use-delete-rearrange-modal-store"
import { useDeleteRearrange, useBulkDeleteRearrange } from "../services/use-rearrange"

export function DeleteRearrangeModal() {
  const { isOpen, isBulkOpen, rearrangeId, snippet, selectedIds, closeModal } = useDeleteRearrangeModalStore()
  const deleteMutation = useDeleteRearrange()
  const bulkDeleteMutation = useBulkDeleteRearrange()

  const handleDeleteSingle = async () => {
    if (!rearrangeId) return
    try {
      await deleteMutation.mutateAsync({ id: rearrangeId })
      toast.success("Rearrange question deleted successfully.")
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question")
    }
  }

  const handleDeleteBulk = async () => {
    if (!selectedIds.length) return
    try {
      await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
      toast.success(`${selectedIds.length} Rearrange questions deleted successfully.`)
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete questions")
    }
  }

  const isPending = deleteMutation.isPending || bulkDeleteMutation.isPending

  if (isBulkOpen) {
    return (
      <AlertDialog open={isBulkOpen} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Questions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {selectedIds.length} selected Rearrange question(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={closeModal} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleDeleteBulk}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isPending ? "Deleting..." : "Delete Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Rearrange Question</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this question?
            {snippet && (
              <span className="block mt-2 p-2.5 bg-muted rounded text-xs font-mono text-foreground border line-clamp-3">
                {snippet}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={closeModal} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleDeleteSingle}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
