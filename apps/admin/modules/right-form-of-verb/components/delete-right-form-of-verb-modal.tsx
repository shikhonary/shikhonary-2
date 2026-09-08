"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { useDeleteRightFormOfVerbModalStore } from "../store/use-delete-right-form-of-verb-modal-store"
import { useDeleteRightFormOfVerb, useBulkDeleteRightFormOfVerbs } from "../services/use-right-form-of-verb"
import { toast } from "@workspace/ui/components/sonner"

export function DeleteRightFormOfVerbModal() {
  const { isOpen, rightFormOfVerbId, rightFormOfVerbContent, selectedIds, closeModal } =
    useDeleteRightFormOfVerbModalStore()

  const deleteMutation = useDeleteRightFormOfVerb()
  const bulkDeleteMutation = useBulkDeleteRightFormOfVerbs()

  const isBulk = selectedIds.length > 0
  const isPending = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleConfirm = async () => {
    try {
      if (isBulk) {
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${selectedIds.length} questions`)
      } else if (rightFormOfVerbId) {
        await deleteMutation.mutateAsync({ id: rightFormOfVerbId })
        toast.success("Question deleted successfully")
      }
      closeModal()
    } catch {
      toast.error("Failed to delete question. Please try again.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isBulk ? "Delete Selected Questions" : "Delete Question"}</DialogTitle>
          <DialogDescription>
            {isBulk ? (
              <span>
                Are you sure you want to delete <strong>{selectedIds.length}</strong> selected Right Form of Verbs questions? This action cannot be undone.
              </span>
            ) : (
              <span>
                Are you sure you want to delete this Right Form of Verbs question?
                {rightFormOfVerbContent && (
                  <span className="block mt-2 italic text-xs border-l-2 border-outline-variant pl-2 py-0.5 text-on-surface-variant">
                    &quot;{rightFormOfVerbContent}...&quot;
                  </span>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeModal} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
