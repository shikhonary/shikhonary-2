"use client"

import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteShortAnswerModalStore } from "../store/use-delete-short-answer-modal-store"
import { useDeleteShortAnswer, useBulkDeleteShortAnswers } from "../services/use-short-answer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

export function DeleteShortAnswerModal() {
  const { isOpen, isBulkOpen, saId, questionSnippet, selectedIds, closeModal } =
    useDeleteShortAnswerModalStore()

  const deleteMutation = useDeleteShortAnswer()
  const bulkDeleteMutation = useBulkDeleteShortAnswers()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      if (isBulkOpen) {
        const count = selectedIds.length
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${count} Short Answer questions.`)
      } else if (saId) {
        await deleteMutation.mutateAsync({ id: saId })
        toast.success("Short Answer question deleted successfully.")
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Short Answer")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen || isBulkOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Warning Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              {isBulkOpen ? `Delete ${selectedIds.length} Short Answers?` : "Delete Short Answer?"}
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              This action requires confirmation
            </p>
          </div>
        </div>

        {/* Textual Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            {isBulkOpen ? (
              <>
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-on-surface">
                  {selectedIds.length} selected Short Answer questions
                </span>
                ? All associated database records, answers, and analytics will be permanently removed.
              </>
            ) : (
              <>
                Are you sure you want to delete this Short Answer question:
                <strong className="block mt-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs font-mono text-on-surface-variant line-clamp-2 break-all font-medium">
                  &quot;{questionSnippet || "(No Question - ID: " + saId + ")"}&quot;
                </strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Informational Alert Box */}
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
          <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="leading-snug">
            This action cannot be undone. Associated test entries and historical answers will be affected.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Short Answer</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
