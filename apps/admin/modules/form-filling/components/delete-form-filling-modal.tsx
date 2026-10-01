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
import { useDeleteFormFillingModalStore } from "../store/use-delete-form-filling-modal-store"
import { useDeleteFormFilling, useBulkDeleteFormFilling } from "../services/use-form-filling"

interface DeleteFormFillingModalProps {
  onSuccess?: () => void
}

export function DeleteFormFillingModal({ onSuccess }: DeleteFormFillingModalProps) {
  const { isOpen, formFillingId, scenarioText, selectedIds, closeModal } =
    useDeleteFormFillingModalStore()

  const deleteSingle = useDeleteFormFilling()
  const deleteBulk = useBulkDeleteFormFilling()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Form Filling items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Form Filling items")
          },
        }
      )
    } else if (formFillingId) {
      deleteSingle.mutate(
        { id: formFillingId },
        {
          onSuccess: () => {
            toast.success("Form Filling item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Form Filling item")
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
            {isBulk ? "Delete Selected Form Filling Items" : "Delete Form Filling Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Form Filling entries? This action cannot be undone.`
              : `Are you sure you want to delete "${scenarioText ?? "this Form Filling entry"}"? This action cannot be undone.`}
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
