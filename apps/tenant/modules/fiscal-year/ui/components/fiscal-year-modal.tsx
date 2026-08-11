"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { DatePicker } from "@workspace/ui/components/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Calendar, Tag, CheckSquare, Loader2 } from "lucide-react"

import { useFiscalYearModalStore } from "../store/use-fiscal-year-modal-store"

export function FiscalYearModal() {
  const queryClient = useQueryClient()
  const { isOpen, fiscalYear, closeModal } = useFiscalYearModalStore()

  const [yearInput, setYearInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCurrent, setIsCurrent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (fiscalYear) {
        setYearInput(fiscalYear.year)
        setStartDate(fiscalYear.startDate ? new Date(fiscalYear.startDate) : undefined)
        setEndDate(fiscalYear.endDate ? new Date(fiscalYear.endDate) : undefined)
        setIsCurrent(fiscalYear.isCurrent)
      } else {
        setYearInput("")
        setStartDate(undefined)
        setEndDate(undefined)
        setIsCurrent(false)
      }
    }
  }, [isOpen, fiscalYear])

  const createMutation = useMutation({
    ...trpc.tenantFiscalYear.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantFiscalYear.pathFilter())
      toast.success("অর্থবছর সফলভাবে তৈরি করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "অর্থবছর তৈরি করতে ব্যর্থ হয়েছে")
    },
  })

  const updateMutation = useMutation({
    ...trpc.tenantFiscalYear.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantFiscalYear.pathFilter())
      toast.success("অর্থবছর সফলভাবে আপডেট করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "অর্থবছর আপডেট করতে ব্যর্থ হয়েছে")
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    if (fiscalYear?.id) {
      updateMutation.mutate({
        id: fiscalYear.id,
        year: yearInput,
        startDate,
        endDate,
        isCurrent,
      })
    } else {
      createMutation.mutate({
        year: yearInput,
        startDate,
        endDate,
        isCurrent,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-lg p-0">
        {/* Tenant App Signature Green Gradient Header Banner */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-extrabold text-primary-foreground">
                {fiscalYear ? "অর্থবছর সম্পাদনা করুন" : "নতুন অর্থবছর যুক্ত করুন"}
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                অর্থবছরের শিরোনাম, সময়সীমা ও সক্রিয় স্ট্যাটাস নির্ধারণ করুন
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Year Label */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground">
              অর্থবছরের নাম
            </Label>
            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                placeholder="যেমন: ২০২৫-২০২৬ বা ২০২৬"
                disabled={isSubmitting}
                required
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                শুরুর তারিখ
              </Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                disabled={isSubmitting}
                placeholder="তারিখ নির্বাচন করুন"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                শেষের তারিখ
              </Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                disabled={isSubmitting}
                placeholder="তারিখ নির্বাচন করুন"
              />
            </div>
          </div>

          {/* Checkbox Box with Green Tint */}
          <div className="flex items-center space-x-3 rounded-xl border border-primary/20 p-4 bg-primary/5">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              disabled={isSubmitting}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="size-4.5 rounded border-primary/30 bg-background text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
            />
            <div className="grid gap-0.5 leading-none">
              <label
                htmlFor="isCurrent"
                className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5"
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                বর্তমান সক্রিয় অর্থবছর হিসেবে সেট করুন
              </label>
              <p className="text-[11px] text-muted-foreground">
                সক্রিয় করলে পূর্ববর্তী সক্রিয় অর্থবছরটি স্বয়ংক্রিয়ভাবে আর্কাইভ হবে।
              </p>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={closeModal}
              className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !yearInput.trim() || !startDate || !endDate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </div>
              ) : fiscalYear ? (
                "আপডেট করুন"
              ) : (
                "সংরক্ষণ করুন"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
