"use client"

import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Calendar, Loader2, Save, AlertCircle } from "lucide-react"

import { useCreateAcademicYear } from "../services/use-academic-year"
import { useCreateAcademicYearModalStore } from "../store/use-create-academic-year-modal-store"

export function CreateAcademicYearModal() {
  const { isOpen, closeModal } = useCreateAcademicYearModalStore()
  const createMutation = useCreateAcademicYear()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [nameEn, setNameEn] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isCurrent, setIsCurrent] = useState(false)
  const [isActive, setIsActive] = useState(true)

  const isSubmitting = createMutation.isPending

  const resetForm = () => {
    setNameEn("")
    setNameBn("")
    setStartDate("")
    setEndDate("")
    setIsCurrent(false)
    setIsActive(true)
    setErrorMessage(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
      closeModal()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nameEn.trim() || !nameBn.trim()) {
      setErrorMessage("অনুগ্রহ করে শিক্ষাবর্ষের বাংলা ও ইংরেজি উভয় নাম পূরণ করুন।")
      return
    }

    if (!startDate || !endDate) {
      setErrorMessage("অনুগ্রহ করে শুরুর তারিখ ও সমাপ্তির তারিখ নির্বাচন করুন।")
      return
    }

    try {
      await createMutation.mutateAsync({
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent,
        isActive,
      })

      toast.success("নতুন শিক্ষাবর্ষ সফলভাবে তৈরি করা হয়েছে।")
      resetForm()
      closeModal()
    } catch (err: any) {
      const msg = err.message || "শিক্ষাবর্ষ তৈরিতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-200/60 dark:border-white/[0.06] p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground font-headline">
                নতুন শিক্ষাবর্ষ যোগ করুন
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-body">
                শিক্ষাবর্ষের নাম, সময়কাল এবং বর্তমান অবস্থা নির্ধারণ করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-3 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Name Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name BN */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শিক্ষাবর্ষের নাম (বাংলা) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="যেমন: শিক্ষাবর্ষ ২০২৬"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
              />
            </div>

            {/* Name EN */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শিক্ষাবর্ষের নাম (ইংরেজি) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. Academic Year 2026"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-mono"
              />
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শুরুর তারিখ <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                disabled={isSubmitting}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                সমাপ্তির তারিখ <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                disabled={isSubmitting}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
              />
            </div>
          </div>

          {/* Is Current Year Switch */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="create-year-current"
                className="text-xs font-bold text-foreground cursor-pointer"
              >
                বর্তমান শিক্ষাবর্ষ নির্ধারণ করুন
              </Label>
              <p className="text-[11px] text-muted-foreground">
                এটি নির্বাচন করলে পূর্ববর্তী বর্তমান বছরটি স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।
              </p>
            </div>
            <Switch
              id="create-year-current"
              checked={isCurrent}
              onCheckedChange={setIsCurrent}
              disabled={isSubmitting}
            />
          </div>

          {/* Is Active Switch */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="create-year-active"
                className="text-xs font-bold text-foreground cursor-pointer"
              >
                শিক্ষাবর্ষটি সক্রিয় রাখুন
              </Label>
              <p className="text-[11px] text-muted-foreground">
                সক্রিয় থাকলে পোর্টাল ও পরীক্ষায় এই শিক্ষাবর্ষটি ব্যবহার করা যাবে।
              </p>
            </div>
            <Switch
              id="create-year-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>শিক্ষাবর্ষ সংরক্ষণ করুন</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
