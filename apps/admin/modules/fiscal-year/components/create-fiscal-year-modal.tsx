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
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { DatePicker } from "@workspace/ui/components/date-picker"
import { Calendar, Tag, CheckSquare, Loader2, Save } from "lucide-react"

import { useCreateFiscalYear } from "../services/use-fiscal-year"
import { useCreateFiscalYearModalStore } from "../store/use-create-fiscal-year-modal-store"

export function CreateFiscalYearModal() {
  const { isOpen, closeModal } = useCreateFiscalYearModalStore()
  const createMutation = useCreateFiscalYear()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [yearInput, setYearInput] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCurrent, setIsCurrent] = useState(false)

  const isSubmitting = createMutation.isPending

  const resetForm = () => {
    setYearInput("")
    setStartDate(undefined)
    setEndDate(undefined)
    setIsCurrent(false)
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

    if (!startDate || !endDate || !yearInput.trim()) {
      setErrorMessage("Please fill in all required fields.")
      return
    }

    try {
      await createMutation.mutateAsync({
        year: yearInput,
        startDate,
        endDate,
        isCurrent,
      })

      toast.success("Fiscal year created successfully.")
      resetForm()
      closeModal()
    } catch (err: any) {
      const msg = err.message || "Failed to create fiscal year"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "500px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-0 shadow-xl text-left gap-0"
      >
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-6 flex flex-row items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-xl font-extrabold text-on-surface normal-case tracking-normal">
              Fiscal Year Details
            </CardTitle>
            <p className="text-xs font-body-md text-on-surface-variant mt-0.5">
              Configure financial year label, duration, and active status.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-3 mb-4 text-error">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="font-body-md text-xs font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Year Label */}
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Fiscal Year Label *
              </Label>
              <div className="group relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                <Input
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  placeholder="e.g. 2026 or 2025-2026"
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-lg border border-outline-variant py-2.5 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Start Date *
                </Label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  disabled={isSubmitting}
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  End Date *
                </Label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  disabled={isSubmitting}
                  placeholder="Select end date"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
              <input
                type="checkbox"
                id="isCurrent"
                checked={isCurrent}
                disabled={isSubmitting}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor="isCurrent"
                  className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  Set as Current Active Fiscal Year
                </label>
                <p className="text-[11px] text-on-surface-variant">
                  Will automatically archive previous active fiscal year.
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-outline-variant">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !yearInput.trim() || !startDate || !endDate}
                className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>Save Fiscal Year</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
