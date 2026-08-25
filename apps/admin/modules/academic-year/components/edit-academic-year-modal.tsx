"use client"

import { useState, useEffect } from "react"
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
import { Calendar, CheckSquare, Loader2, Save } from "lucide-react"

import { useAcademicYearById, useUpdateAcademicYear } from "../services/use-academic-year"
import { useEditAcademicYearModalStore } from "../store/use-edit-academic-year-modal-store"

export function EditAcademicYearModal() {
  const { isOpen, yearId, closeModal } = useEditAcademicYearModalStore()
  const { data: year, isLoading, isError } = useAcademicYearById(yearId ?? "", isOpen && Boolean(yearId))
  const updateMutation = useUpdateAcademicYear()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [nameEn, setNameEn] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isCurrent, setIsCurrent] = useState(false)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (year) {
      setNameEn(year.nameEn)
      setNameBn(year.nameBn)
      setStartDate(year.startDate ? new Date(year.startDate) : undefined)
      setEndDate(year.endDate ? new Date(year.endDate) : undefined)
      setIsCurrent(year.isCurrent)
      setIsActive(year.isActive)
    }
  }, [year])

  const isSubmitting = updateMutation.isPending

  const resetForm = () => {
    setNameEn("")
    setNameBn("")
    setStartDate(undefined)
    setEndDate(undefined)
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
    if (!yearId) return
    setErrorMessage(null)

    if (!startDate || !endDate || !nameEn.trim() || !nameBn.trim()) {
      setErrorMessage("Please fill in all required fields.")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: yearId,
        nameEn,
        nameBn,
        startDate,
        endDate,
        isCurrent,
        isActive,
      })

      toast.success("Academic year updated successfully.")
      closeModal()
    } catch (err: any) {
      const msg = err.message || "Failed to update academic year"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "600px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-0 shadow-xl text-left gap-0"
      >
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-6 flex flex-row items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-xl font-extrabold text-on-surface normal-case tracking-normal">
              Edit Academic Year
            </CardTitle>
            <p className="text-xs font-body-md text-on-surface-variant mt-0.5">
              Modify academic year labels, duration, and status mappings.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-on-surface-variant">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 font-body-md text-sm">Loading academic year details...</span>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-error">
              <p className="font-body-md font-medium">Failed to load academic year details.</p>
              <Button className="mt-4" onClick={() => handleOpenChange(false)}>Close</Button>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-3 mb-4 text-error">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span className="font-body-md text-xs font-medium">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Academic Year Names (English & Bangla) */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Name EN */}
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Year Name (English) *
                    </Label>
                    <Input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Academic Year 2026"
                      disabled={isSubmitting}
                      required
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary h-auto disabled:opacity-50"
                    />
                  </div>

                  {/* Name BN */}
                  <div className="space-y-2">
                    <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                      Year Name (Bangla) *
                    </Label>
                    <Input
                      value={nameBn}
                      onChange={(e) => setNameBn(e.target.value)}
                      placeholder="e.g. শিক্ষাবর্ষ ২০২৬"
                      disabled={isSubmitting}
                      required
                      className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary h-auto disabled:opacity-50"
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

                {/* Is Current Checkbox */}
                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={isCurrent}
                    disabled={isSubmitting}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label
                      htmlFor="isCurrent"
                      className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-primary animate-pulse" />
                      Set as Current Active Academic Year
                    </label>
                    <p className="text-[11px] text-on-surface-variant">
                      Will automatically archive the previous current year.
                    </p>
                  </div>
                </div>

                {/* Is Active Checkbox */}
                <div className="flex items-center space-x-3 rounded-lg border border-outline-variant/40 p-3 bg-surface-container-low">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    disabled={isSubmitting}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer disabled:opacity-50"
                  />
                  <div className="grid gap-0.5 leading-none">
                    <label
                      htmlFor="isActive"
                      className="text-xs font-bold text-on-surface cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      Enable/Activate Academic Year
                    </label>
                    <p className="text-[11px] text-on-surface-variant">
                      Allows portal queries and database lookups to locate this year.
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => handleOpenChange(false)}
                    className="rounded-lg border border-outline px-6 py-2.5 font-bold text-primary hover:bg-surface-container-low transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !nameEn.trim() || !nameBn.trim() || !startDate || !endDate}
                    className="rounded-lg bg-primary-container px-8 py-2.5 font-bold text-on-primary-container shadow-md hover:bg-primary hover:text-white transition-all cursor-pointer h-auto text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Save className="h-4 w-4" />
                        <span>Update Year</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
