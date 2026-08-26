"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDeleteQuestionPaper } from "../services/use-question-paper"
import { useDeleteQuestionPaperModalStore } from "../store/use-delete-question-paper-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

export function DeleteQuestionPaperModal() {
  const { isOpen, paperId, paperTitle, closeModal } =
    useDeleteQuestionPaperModalStore()

  const deleteMutation = useDeleteQuestionPaper()

  const handleConfirmDelete = async () => {
    if (!paperId) return

    try {
      await deleteMutation.mutateAsync({ id: paperId })
      toast.success(
        `প্রশ্নপত্র "${paperTitle || "Question Paper"}" সফলভাবে মুছে ফেলা হয়েছে।`
      )
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "মুছে ফেলতে ব্যর্থ হয়েছে")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
              প্রশ্নপত্র মুছবেন?
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              এই কার্যক্রমে নিশ্চিতকরণ প্রয়োজন
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body">
          <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
            আপনি কি নিশ্চিতভাবে{" "}
            <span className="font-bold text-on-surface">
              &quot;{paperTitle || "নির্বাচিত প্রশ্নপত্র"}&quot;
            </span>{" "}
            মুছে ফেলতে চান? এর সাথে সম্পর্কিত সমস্ত সেকশন, প্রশ্ন ও নম্বর বণ্টনের রেকর্ড সফট-ডিলিট করা হবে।
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700 font-body">
          <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="leading-snug">
            এই কার্যক্রমটি সম্পাদন করার পর প্রশ্নপত্রটি ড্যাশবোর্ড থেকে অদৃশ্য হয়ে যাবে।
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
          >
            বাতিল করুন
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleConfirmDelete}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer h-10 disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>মুছা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>নিশ্চিত মুছুন</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
