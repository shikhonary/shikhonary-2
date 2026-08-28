"use client"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  HelpCircle,
  Plus,
  Trash2,
  MoreVertical,
  Pen,
  ToggleLeft,
  ToggleRight,
  Hash,
  Award
} from "lucide-react"

import { useRouter } from "next/navigation"

export interface QuestionTypeItem {
  id: string
  nameEn: string
  nameBn: string
  label?: string | null
  mark: number
  position: number
  isActive: boolean
  descriptionEn?: string | null
  descriptionBn?: string | null
}

interface QuestionTypeTableProps {
  items: QuestionTypeItem[]
  isLoading: boolean
  isError: boolean
  onDelete: (id: string, name: string) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
}

export function QuestionTypeTable({
  items,
  isLoading,
  isError,
  onDelete,
  onToggleActive,
}: QuestionTypeTableProps) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
      {isLoading ? (
        <div className="p-8 text-center text-on-surface-variant text-sm font-body-md flex items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary">
            progress_activity
          </span>
          <span>Loading question types...</span>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-error">
          <p className="font-body-md font-medium">Failed to load question types.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-on-surface">No question types found.</p>
          <Button size="sm" onClick={() => router.push("/question-types/create")} className="mt-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-white transition-colors font-bold">
            <Plus className="h-4 w-4 mr-1" /> Add Question Type
          </Button>
        </div>
      ) : (
        <div>
          {/* Mobile Card List View (< md) */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
            {items.map((qt) => {
              return (
                <div
                  key={qt.id}
                  className="group relative flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-headline-md text-base font-extrabold text-primary truncate">
                          {qt.nameEn}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant truncate">{qt.nameBn}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="rounded-md border border-outline-variant/30 bg-surface px-1.5 py-0 text-[9px] font-bold text-outline">
                            {qt.label || "-"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`rounded-full px-2 py-0.5 text-[9px] uppercase font-bold border-0 shadow-none ${
                              qt.isActive
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-surface-variant text-on-surface-variant"
                            }`}
                          >
                            {qt.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8 shrink-0"
                          title="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                        <DropdownMenuItem
                          onClick={() => router.push(`/question-types/${qt.id}/edit`)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          <Pen className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onToggleActive(qt.id, qt.isActive)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                        >
                          {qt.isActive ? (
                            <>
                              <ToggleLeft className="h-3.5 w-3.5 text-amber-500" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(qt.id, qt.nameEn)}
                          className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1.5 border-t border-outline-variant/20 pt-2 text-[10px] text-on-surface-variant font-medium justify-between">
                    <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Mark: <span className="font-bold text-on-surface">{qt.mark}</span></span>
                    <span className="flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Position: <span className="font-bold text-on-surface">{qt.position}</span></span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block">
            <Table className="w-full text-left font-body-md">
              <TableHeader className="bg-surface-container-low border-b border-outline-variant">
                <TableRow className="border-b border-outline-variant bg-surface-container-low hover:bg-surface-container-low">
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Name (EN)
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Name (BN)
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Label / Code
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Mark
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Position
                  </TableHead>
                  <TableHead className="px-6 py-4 font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right font-label-sm font-semibold tracking-wider text-outline uppercase h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-outline-variant/30">
                {items.map((qt) => {
                  return (
                    <TableRow key={qt.id} className="hover:bg-surface-container-low transition-all duration-200 ease-in-out group border-b border-outline-variant/30">
                      <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface font-semibold transition-all duration-200 ease-in-out">
                        {qt.nameEn}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface-variant transition-all duration-200 ease-in-out">
                        {qt.nameBn}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out">
                        <Badge variant="outline" className="rounded-md border border-outline-variant/30 bg-surface-container-lowest px-2 py-0.5 text-xs font-bold text-outline">
                          {qt.label || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface transition-all duration-200 ease-in-out">
                        {qt.mark}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-on-surface-variant transition-all duration-200 ease-in-out">
                        {qt.position}
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out">
                        <Badge
                          variant="outline"
                          className={`rounded-full px-2.5 py-0.5 text-xs uppercase font-bold border-0 shadow-none ${
                            qt.isActive
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-surface-variant text-on-surface-variant"
                          }`}
                        >
                          {qt.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high cursor-pointer h-8 w-8"
                              title="Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-outline-variant shadow-md rounded-xl p-1.5 min-w-[140px]">
                            <DropdownMenuItem
                              onClick={() => router.push(`/question-types/${qt.id}/edit`)}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            >
                              <Pen className="h-3.5 w-3.5" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onToggleActive(qt.id, qt.isActive)}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high"
                            >
                              {qt.isActive ? (
                                <>
                                  <ToggleLeft className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Activate</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(qt.id, qt.nameEn)}
                              className="cursor-pointer gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error hover:bg-error-container/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
