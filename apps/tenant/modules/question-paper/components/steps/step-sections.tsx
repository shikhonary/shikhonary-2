"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { List, Plus, Trash2, ChevronUp, ChevronDown, Info } from "lucide-react"
import type { StepProps, WizardSection } from "../../types/create-wizard"

export function StepSections({ data, onChange, errors }: StepProps) {
  const [newTitle, setNewTitle] = useState("")
  const [newTitleBn, setNewTitleBn] = useState("")
  const [newInstructions, setNewInstructions] = useState("")

  const addSection = () => {
    if (!newTitle.trim()) return
    const section: WizardSection = {
      tempId: crypto.randomUUID(),
      title: newTitle.trim(),
      titleBn: newTitleBn.trim(),
      instructions: newInstructions.trim(),
      orderIndex: data.sections.length,
    }
    onChange({ sections: [...data.sections, section] })
    setNewTitle("")
    setNewTitleBn("")
    setNewInstructions("")
  }

  const removeSection = (tempId: string) => {
    const updated = data.sections
      .filter((s) => s.tempId !== tempId)
      .map((s, i) => ({ ...s, orderIndex: i }))
    onChange({ sections: updated })
  }

  const moveSection = (tempId: string, direction: "up" | "down") => {
    const index = data.sections.findIndex((s) => s.tempId === tempId)
    if (index < 0) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === data.sections.length - 1) return

    const next = [...data.sections]
    const swapIdx = direction === "up" ? index - 1 : index + 1
    const temp = next[index]!
    next[index] = next[swapIdx]!
    next[swapIdx] = temp
    onChange({ sections: next.map((s, i) => ({ ...s, orderIndex: i })) })
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <List className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
            বিভাগ সমূহ
          </CardTitle>
          <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5 font-body">
            প্রশ্নপত্রের বিভাগ যোগ করুন (যেমন: বিভাগ ক, বিভাগ খ)
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-6">
        {/* Info notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-on-surface font-body">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            বিভাগ ঐচ্ছিক। আপনি এই ধাপটি এড়িয়ে গিয়ে পরবর্তী ধাপে যেতে পারেন।
          </p>
        </div>

        {/* Add Section Form */}
        <div className="space-y-4 border-t border-outline-variant/40 pt-6">
          <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            নতুন বিভাগ যোগ করুন
          </Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] text-outline font-body">শিরোনাম (ইংরেজি) *</label>
              <Input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Section A"
                className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-outline font-body">বাংলা শিরোনাম (ঐচ্ছিক)</label>
              <Input
                type="text"
                value={newTitleBn}
                onChange={(e) => setNewTitleBn(e.target.value)}
                placeholder="উদা: বিভাগ ক"
                className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-outline font-body">নির্দেশনা (ঐচ্ছিক)</label>
            <Input
              type="text"
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="উদা: যেকোনো ৫টি প্রশ্নের উত্তর দিন"
              className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
            />
          </div>
          <Button
            type="button"
            onClick={addSection}
            disabled={!newTitle.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 font-bold text-on-primary-container text-sm transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal font-display"
          >
            <Plus className="h-4 w-4" />
            <span>বিভাগ যোগ করুন</span>
          </Button>
        </div>

        {/* Sections List */}
        {data.sections.length > 0 && (
          <div className="space-y-3 border-t border-outline-variant/40 pt-6">
            <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              যোগ করা বিভাগ সমূহ ({data.sections.length})
            </Label>
            <div className="space-y-2">
              {data.sections.map((section, idx) => (
                <div
                  key={section.tempId}
                  className="flex items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3 hover:bg-surface-container-low transition-colors font-body"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {section.title}
                      {section.titleBn && (
                        <span className="text-outline font-normal ml-1.5">({section.titleBn})</span>
                      )}
                    </p>
                    {section.instructions && (
                      <p className="text-[11px] text-outline truncate mt-0.5">{section.instructions}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => moveSection(section.tempId, "up")}
                      disabled={idx === 0}
                      className="h-7 w-7 rounded-md p-0 hover:bg-surface-container-high cursor-pointer disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => moveSection(section.tempId, "down")}
                      disabled={idx === data.sections.length - 1}
                      className="h-7 w-7 rounded-md p-0 hover:bg-surface-container-high cursor-pointer disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeSection(section.tempId)}
                      className="h-7 w-7 rounded-md p-0 hover:bg-error-container text-error cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
