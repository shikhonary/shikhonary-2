"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { useDeleteSubstitutionTable, useBulkDeleteSubstitutionTables } from "../services/use-substitution-tables"
import { useDeleteSubstitutionTableModalStore } from "../store/use-delete-substitution-table-modal-store"

export function DeleteSubstitutionTableModal() {
  const { isOpen, substitutionTableId, substitutionTableContent, selectedIds, closeModal } =
    useDeleteSubstitutionTableModalStore()

  const [isDeleting, setIsDeleting] = useState(false)
  const deleteMutation = useDeleteSubstitutionTable()
  const bulkDeleteMutation = useBulkDeleteSubstitutionTables()

  const isBulk = selectedIds && selectedIds.length > 0

  const handleConfirm = async () => {
    setIsDeleting(true)

    try {
      if (isBulk) {
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${selectedIds.length} tables.`)
      } else if (substitutionTableId) {
        await deleteMutation.mutateAsync({ id: substitutionTableId })
        toast.success("Substitution Table deleted successfully.")
      }

      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item(s)")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md bg-white border border-outline-variant rounded-xl shadow-lg">
        <DialogHeader className="flex flex-col gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-on-surface">
            {isBulk ? `Delete ${selectedIds.length} Substitution Tables?` : "Delete Substitution Table?"}
          </DialogTitle>
          <DialogDescription className="text-sm text-on-surface-variant">
            {isBulk ? (
              <span>
                Are you sure you want to delete these <strong>{selectedIds.length}</strong> selected tables? This action cannot be undone.
              </span>
            ) : (
              <span>
                Are you sure you want to delete &quot;<strong>{substitutionTableContent || "this table"}</strong>&quot;? This action cannot be undone.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isDeleting}
            className="rounded-lg border-outline-variant text-sm cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-error text-white hover:bg-error/90 text-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
