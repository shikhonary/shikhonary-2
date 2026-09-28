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
import { useDeleteVerbTenseModalStore } from "../store/use-delete-verb-tense-modal-store"
import { useDeleteVerbTense, useBulkDeleteVerbTenses } from "../services/use-verb-tense"
import { Loader2 } from "lucide-react"

export function DeleteVerbTenseModal() {
  const {
    isOpen,
    isBulkOpen,
    deleteId,
    titleSnippet,
    bulkIds,
    closeModal,
    closeBulkModal,
  } = useDeleteVerbTenseModalStore()

  const deleteMutation = useDeleteVerbTense()
  const bulkDeleteMutation = useBulkDeleteVerbTenses()

  const handleDeleteSingle = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync({ id: deleteId })
      toast.success("Verb Tense deleted successfully.")
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Verb Tense.")
    }
  }

  const handleDeleteBulk = async () => {
    if (bulkIds.length === 0) return

    try {
      await bulkDeleteMutation.mutateAsync({ ids: bulkIds })
      toast.success(`${bulkIds.length} Verb Tense items deleted successfully.`)
      closeBulkModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk delete Verb Tense items.")
    }
  }

  return (
    <>
      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent className="rounded-2xl bg-white p-6 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-sm text-xl font-bold text-on-surface">
              Delete Verb Tense?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to delete this Verb Tense item
              {titleSnippet ? ` "${titleSnippet}"` : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteSingle()
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-error hover:bg-error/90 text-white font-bold px-4 h-10 gap-2 shadow-xs"
            >
              {deleteMutation.isPending ? (
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkOpen} onOpenChange={(open) => !open && closeBulkModal()}>
        <AlertDialogContent className="rounded-2xl bg-white p-6 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-sm text-xl font-bold text-on-surface">
              Delete {bulkIds.length} Verb Tense Items?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to delete all {bulkIds.length} selected Verb Tense items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteBulk()
              }}
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl bg-error hover:bg-error/90 text-white font-bold px-4 h-10 gap-2 shadow-xs"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete All</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
