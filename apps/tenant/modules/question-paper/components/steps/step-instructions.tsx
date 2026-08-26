"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { ClipboardList, Plus, Trash2, ChevronUp, ChevronDown, Info } from "lucide-react"
import type { StepProps } from "../../types/create-wizard"

export function StepInstructions({ data, onChange, errors }: StepProps) {
  const [newInstruction, setNewInstruction] = useState("")

  const addInstruction = () => {
    if (!newInstruction.trim()) return
    onChange({ instructions: [...data.instructions, newInstruction.trim()] })
    setNewInstruction("")
  }

  const removeInstruction = (index: number) => {
    onChange({ instructions: data.instructions.filter((_, i) => i !== index) })
  }

  const moveInstruction = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === data.instructions.length - 1) return

    const next = [...data.instructions]
    const swapIdx = direction === "up" ? index - 1 : index + 1
    const temp = next[index]!
    next[index] = next[swapIdx]!
    next[swapIdx] = temp
    onChange({ instructions: next })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInstruction()
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
      <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
        <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
            পরীক্ষার নির্দেশাবলী
          </CardTitle>
          <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5 font-body">
            পরীক্ষার্থীদের জন্য প্রশ্নপত্রে প্রদর্শিত নির্দেশনা যোগ করুন
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-8 space-y-6">
        {/* Info notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-on-surface font-body">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed">
            নির্দেশাবলী ঐচ্ছিক। আপনি এই ধাপটি এড়িয়ে গিয়ে পরবর্তী ধাপে যেতে পারেন।
          </p>
        </div>

        {/* Add Instruction */}
        <div className="space-y-3">
          <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            নতুন নির্দেশনা যোগ করুন
          </Label>
          <div className="flex gap-3">
            <Input
              type="text"
              value={newInstruction}
              onChange={(e) => setNewInstruction(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="উদা: প্রশ্নপত্রটি মনোযোগ সহকারে পড়ুন"
              className="flex-1 rounded-lg border border-outline-variant py-2.5 px-4 font-body text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
            />
            <Button
              type="button"
              onClick={addInstruction}
              disabled={!newInstruction.trim()}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 font-bold text-on-primary-container text-sm transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal font-display shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>যোগ</span>
            </Button>
          </div>
        </div>

        {/* Instructions List */}
        {data.instructions.length > 0 && (
          <div className="space-y-3 border-t border-outline-variant/40 pt-6">
            <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              যোগ করা নির্দেশাবলী ({data.instructions.length})
            </Label>
            <div className="space-y-2">
              {data.instructions.map((instruction, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3 hover:bg-surface-container-low transition-colors font-body"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm text-on-surface min-w-0 truncate">{instruction}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => moveInstruction(idx, "up")}
                      disabled={idx === 0}
                      className="h-7 w-7 rounded-md p-0 hover:bg-surface-container-high cursor-pointer disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => moveInstruction(idx, "down")}
                      disabled={idx === data.instructions.length - 1}
                      className="h-7 w-7 rounded-md p-0 hover:bg-surface-container-high cursor-pointer disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeInstruction(idx)}
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
