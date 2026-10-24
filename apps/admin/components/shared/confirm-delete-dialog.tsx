"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

export interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  itemName?: string
  description?: React.ReactNode
  warningText?: string
  isLoading?: boolean
  cancelLabel?: string
  confirmLabel?: string
  actionRequirementText?: string
  loadingText?: string
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "ডিলিট নিশ্চিতকরণ",
  itemName,
  description,
  warningText,
  isLoading = false,
  cancelLabel = "বাতিল",
  confirmLabel = "স্থায়ীভাবে মুছুন",
  actionRequirementText = "এই কাজের জন্য নিশ্চিতকরণ প্রয়োজন",
  loadingText = "মুছে ফেলা হচ্ছে...",
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        showCloseButton={!isLoading}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-foreground font-headline">
              {title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              {actionRequirementText}
            </p>
          </div>
        </div>

        {/* Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-muted-foreground font-body">
            {description ? (
              description
            ) : (
              <>
                আপনি কি নিশ্চিতভাবে{" "}
                <span className="font-bold text-foreground">
                  &quot;{itemName || "এই রেকর্ডটি"}&quot;
                </span>{" "}
                মুছে ফেলতে চান? এই কাজটি স্থায়ী এবং এটি আর ফেরানো সম্ভব নয়।
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Warning Callout Box */}
        {warningText && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive font-body">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{warningText}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border-slate-200 dark:border-white/[0.08] px-4 py-2 text-xs font-semibold cursor-pointer h-10 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl px-5 py-2 text-xs font-bold shadow-xs cursor-pointer gap-2 h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
