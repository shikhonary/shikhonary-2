"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDeleteProseEssenceModalStore } from "../store/use-delete-prose-essence-modal-store"
import { useDeleteProseEssence, useBulkDeleteProseEssences } from "../services/use-prose-essence"
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
import { Loader2 } from "lucide-react"

export function DeleteProseEssenceModal() {
  const { isOpen, proseEssenceId, proseEssenceTitle, selectedIds, closeModal } =
    useDeleteProseEssenceModalStore()

  const deleteMutation = useDeleteProseEssence()
  const bulkDeleteMutation = useBulkDeleteProseEssences()

  const isBulk = selectedIds.length > 0
  const isSubmitting = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleDelete = async () => {
    try {
      if (isBulk) {
        const res = await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${res.deletedCount} prose essences.`)
      } else if (proseEssenceId) {
        await deleteMutation.mutateAsync({ id: proseEssenceId })
        toast.success("Prose essence deleted successfully.")
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete prose essence")
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <AlertDialogContent className="rounded-2xl border border-outline-variant bg-surface-container-lowest max-w-md p-6">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="font-headline-md text-xl font-bold text-on-surface">
            {isBulk ? `Delete ${selectedIds.length} Prose Essences?` : "Delete Prose Essence?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            {isBulk ? (
              <span>
                Are you sure you want to delete these <strong className="text-on-surface">{selectedIds.length}</strong> prose essences? This action cannot be undone.
              </span>
            ) : (
              <span>
                Are you sure you want to delete <strong className="text-on-surface">"{proseEssenceTitle}"</strong>? This action cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
          <AlertDialogCancel
            disabled={isSubmitting}
            onClick={closeModal}
            className="rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isSubmitting}
            onClick={handleDelete}
            className="rounded-xl bg-error hover:bg-error/90 text-white font-bold px-4 h-10 gap-2 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
