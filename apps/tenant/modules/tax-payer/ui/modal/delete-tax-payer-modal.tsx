"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Trash2, Info, Loader2 } from "lucide-react"

import { useDeleteTaxPayerModalStore } from "../store/use-delete-tax-payer-modal-store"

export function DeleteTaxPayerModal() {
  const queryClient = useQueryClient()
  const { isOpen, id, name, closeModal } = useDeleteTaxPayerModalStore()

  const deleteMutation = useMutation({
    ...trpc.taxPayer.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success(`করদাতা "${name || ""}" সফলভাবে মুছে ফেলা হয়েছে।`)
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "করদাতা মুছতে ব্যর্থ হয়েছে")
    },
  })

  const handleConfirmDelete = () => {
    if (!id) return
    deleteMutation.mutate({ id })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-primary-foreground">
                করদাতা মুছে ফেলবেন?
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                এই প্রক্রিয়া নিশ্চিতকরণ আবশ্যক
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 font-body">
          <p className="font-body text-sm leading-relaxed text-muted-foreground">
            আপনি কি নিশ্চিত যে আপনি{" "}
            <span className="font-bold text-foreground">
              &quot;{name || "নির্বাচিত করদাতা"}&quot;
            </span>{" "}
            মুছে ফেলতে চান?
          </p>

          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p className="leading-snug">
              এই প্রক্রিয়াটি স্থায়ী এবং মুছে ফেলার পর পুনরায় ফিরিয়ে আনা যাবে না।
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={closeModal}
              className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>মুছে ফেলা হচ্ছে...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  <span>করদাতা মুছুন</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
