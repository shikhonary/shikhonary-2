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
import { Loader2, AlertTriangle } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteGenderChangeModalStore } from "../store/use-delete-gender-change-modal-store"
import { useDeleteGenderChange, useBulkDeleteGenderChange } from "../services/use-gender-change"

export function DeleteGenderChangeModal() {
  const { isOpen, genderChangeId, wordText, selectedIds, closeModal } = useDeleteGenderChangeModalStore()
  const deleteMutation = useDeleteGenderChange()
  const bulkDeleteMutation = useBulkDeleteGenderChange()

  const isBulk = selectedIds.length > 0
  const isPending = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleDelete = async () => {
    if (isBulk) {
      bulkDeleteMutation.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} words`)
            closeModal()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected words")
          },
        }
      )
    } else if (genderChangeId) {
      deleteMutation.mutate(
        { id: genderChangeId },
        {
          onSuccess: () => {
            toast.success("Successfully deleted gender change entry")
            closeModal()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete gender change entry")
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md bg-white border border-outline-variant/40">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-on-surface">
                {isBulk ? `Delete ${selectedIds.length} Words` : "Delete Gender Change Entry"}
              </DialogTitle>
              <DialogDescription className="text-xs text-outline mt-1">
                {isBulk
                  ? `Are you sure you want to permanently delete these ${selectedIds.length} words from the question bank?`
                  : `Are you sure you want to delete "${wordText || "this word entry"}"?`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={closeModal}
            disabled={isPending}
            className="text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
