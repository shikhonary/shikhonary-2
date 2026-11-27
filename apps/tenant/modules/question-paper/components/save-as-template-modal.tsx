"use client"

import React, { useState, useEffect } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useSaveAsTemplate } from "../services/use-question-paper"
import { useSaveAsTemplateModalStore } from "../store/use-save-as-template-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Bookmark, Loader2, Info, Sparkles } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

export function SaveAsTemplateModal() {
  const { isOpen, paperId, paperTitle, subjectName, defaultGeneric, closeModal } =
    useSaveAsTemplateModalStore()

  const [templateTitle, setTemplateTitle] = useState("")
  const [description, setDescription] = useState("")
  const [stripSubject, setStripSubject] = useState(true)

  const saveTemplateMutation = useSaveAsTemplate()

  useEffect(() => {
    if (isOpen && paperTitle) {
      setTemplateTitle(paperTitle.includes("টেমপ্লেট") ? paperTitle : `${paperTitle} (টেমপ্লেট)`)
      setDescription("")
      setStripSubject(defaultGeneric !== undefined ? defaultGeneric : true)
    }
  }, [isOpen, paperTitle, defaultGeneric])

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paperId) return

    const trimmedTitle = templateTitle.trim()
    if (!trimmedTitle) {
      toast.error("অনুগ্রহ করে টেমপ্লেটের নাম প্রদান করুন")
      return
    }

    try {
      await saveTemplateMutation.mutateAsync({
        paperId,
        templateTitle: trimmedTitle,
        description: description.trim() || undefined,
        stripSubject,
      })
      toast.success(`"${trimmedTitle}" টেমপ্লেট হিসেবে সফলভাবে সংরক্ষিত হয়েছে!`)
      closeModal()
    } catch (err: any) {
      toast.error(err?.message || "টেমপ্লেট সংরক্ষণ করা যায়নি")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display"
      >
        {/* Header Icon + Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
              টেমপ্লেট হিসেবে সংরক্ষণ
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              প্রশ্নপত্রের লেআউট ও মানবন্টন পরবর্তী ব্যবহারের জন্য সেভ করুন
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body">
          <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
            আপনি{" "}
            <span className="font-bold text-on-surface">
              &quot;{paperTitle || "নির্বাচিত প্রশ্নপত্র"}&quot;
            </span>
            -এর লেআউট দিয়ে একটি প্রশ্নহীন ব্লুপ্রিন্ট টেমপ্লেট তৈরি করছেন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmSave} className="space-y-3.5 font-body">
          {/* Template Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center justify-between">
              <span>টেমপ্লেটের নাম</span>
              <span className="text-[11px] text-outline font-normal">*বাধ্যতামূলক</span>
            </label>
            <Input
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              placeholder="যেমন: ৯ম শ্রেণি - বিজ্ঞান বিভাগ বার্ষিক ফরম্যাট"
              className="h-10 rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline focus-visible:ring-primary/20"
              required
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">
              সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
            </label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="যেমন: CQ ৫০ + MCQ ২৫, সময় ২ ঘণ্টা ৩০ মিনিট..."
              className="rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline resize-none focus-visible:ring-primary/20"
            />
          </div>

          {/* Subject Setting Policy Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface">
              বিষয় নির্ধারণ নীতি
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Generic Option */}
              <button
                type="button"
                onClick={() => setStripSubject(true)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5",
                  stripSubject
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-white border-outline-variant/50 hover:bg-surface-container-high"
                )}
              >
                <div className="mt-0.5">
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center transition-colors",
                      stripSubject
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-outline"
                    )}
                  >
                    {stripSubject && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface">
                      সাধারণ ব্লুপ্রিন্ট (সকল বিষয়ের জন্য উন্মুক্ত)
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>প্রস্তাবিত</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-outline mt-0.5 leading-snug">
                    এই টেমপ্লেট দিয়ে পদার্থবিজ্ঞান, রসায়ন, গণিত বা যেকোনো বিষয়ের প্রশ্ন তৈরি করা যাবে।
                  </p>
                </div>
              </button>

              {/* Subject-Specific Option */}
              <button
                type="button"
                onClick={() => setStripSubject(false)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5",
                  !stripSubject
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : "bg-white border-outline-variant/50 hover:bg-surface-container-high"
                )}
              >
                <div className="mt-0.5">
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center transition-colors",
                      !stripSubject
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-outline"
                    )}
                  >
                    {!stripSubject && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-on-surface">
                    নির্দিষ্ট বিষয় হিসেবে সংরক্ষণ {subjectName ? `(${subjectName})` : ""}
                  </span>
                  <p className="text-[11px] text-outline mt-0.5 leading-snug">
                    ভবিষ্যতে এই টেমপ্লেট নির্বাচন করলে স্বয়ংক্রিয়ভাবে এই বিষয়টি নির্ধারিত থাকবে।
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Info Callout */}
          <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-body">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p className="leading-snug">
              <strong>প্রশ্নহীন কাঠামো:</strong> কোনো প্রশ্ন সেভ হবে না। শুধুমাত্র শ্রেণি, মানবন্টন, সেকশন এবং কাগজের মার্জিন ও লেআউট সেটিংস সংরক্ষিত থাকবে।
            </p>
          </div>

          {/* Action Buttons Matching Duplicate Modal */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={saveTemplateMutation.isPending}
              onClick={closeModal}
              className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={saveTemplateMutation.isPending || !templateTitle.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs"
            >
              {saveTemplateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  <span>টেমপ্লেট সেভ করুন</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
