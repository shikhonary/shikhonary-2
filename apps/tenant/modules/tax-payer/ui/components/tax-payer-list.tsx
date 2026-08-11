"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  User,
  Trash2,
  Pen,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  Building2,
  Coins,
  Eye,
  CreditCard,
  Phone,
} from "lucide-react"

import { HoldingCardViewComponent } from "./holding-card-view-component"
import { useTaxPayerCardModalStore } from "../store/use-tax-payer-card-modal-store"
import { useDeleteTaxPayerModalStore } from "../store/use-delete-tax-payer-modal-store"

interface TaxPayerListProps {
  pagedItems: any[]
  tenant: any
  viewMode: "table" | "cards"
  totalItems: number
  displayStart: number
  displayEnd: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  setCurrentPage: (val: number) => void
  handleCollectTax: (tp: any) => void
}

export function TaxPayerList({
  pagedItems,
  tenant,
  viewMode,
  totalItems,
  displayStart,
  displayEnd,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
  handleCollectTax,
}: TaxPayerListProps) {
  const router = useRouter()
  const { openModal: openCardModal } = useTaxPayerCardModalStore()
  const { openModal: openDeleteModal } = useDeleteTaxPayerModalStore()

  if (pagedItems.length === 0) {
    return null // Handled in view coordinator for empty state
  }

  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 bg-muted/10">
        {pagedItems.map((tp: any) => (
          <div
            key={tp.id}
            className="flex flex-col items-center bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <HoldingCardViewComponent taxPayer={tp} tenant={tenant} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {pagedItems.map((tp: any) => {
          const hasUnpaidTax =
            !tp.payments ||
            tp.payments.length === 0 ||
            tp.payments.some((p: any) => !p.paymentMethod)

          return (
            <div
              key={tp.id}
              className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                    <User className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                        #{tp.holding}
                      </span>
                      <h4
                        onClick={() => router.push(`/tax-payers/${tp.id}`)}
                        className="font-display text-base font-extrabold text-foreground truncate cursor-pointer hover:underline"
                      >
                        {tp.name}
                      </h4>
                    </div>
                    {tp.fatherName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                        পিতা: {tp.fatherName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer h-9 w-9 shrink-0"
                        title="অ্যাকশন"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[160px] text-popover-foreground"
                    >
                      <DropdownMenuItem
                        onClick={() => router.push(`/tax-payers/${tp.id}`)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>প্রোফাইল ও ইতিহাস</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openCardModal(tp)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                        <span>স্মার্ট কার্ড দেখুন</span>
                      </DropdownMenuItem>
                      {hasUnpaidTax && (
                        <DropdownMenuItem
                          onClick={() => handleCollectTax(tp)}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                        >
                          <Coins className="h-3.5 w-3.5" />
                          <span>কর আদায় করুন</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => router.push(`/tax-payers/${tp.id}/edit`)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <Pen className="h-3.5 w-3.5 text-blue-600" />
                        <span>সম্পাদনা</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteModal(tp.id, tp.name)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>মুছে ফেলুন</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{tp.ward?.nameBn || tp.ward?.name || "N/A"}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold font-mono">
                  <Coins className="h-3.5 w-3.5 shrink-0" />
                  <span>৳{tp.tax?.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{tp.village || "N/A"}</span>
                </div>
                {tp.phone && (
                  <div className="flex items-center justify-end gap-1.5 text-muted-foreground font-mono">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{tp.phone}</span>
                  </div>
                )}

                {tp.nid && (
                  <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground font-mono pt-1">
                    <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">NID: {tp.nid}</span>
                  </div>
                )}

                {hasUnpaidTax && (
                  <div className="col-span-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleCollectTax(tp)}
                      className="w-full h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 shadow-sm cursor-pointer"
                    >
                      <Coins className="h-4 w-4" />
                      <span>কর আদায় করুন</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block">
        <Table className="w-full text-left font-body">
          <TableHeader className="bg-white/[0.02] border-b border-white/[0.05]">
            <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                হোল্ডিং নম্বর
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                করদাতার নাম ও পরিচয়
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                ওয়ার্ড ও গ্রাম
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto text-right">
                ধার্যকৃত বাৎসরিক কর
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                যোগাযোগ ও পরিচয়
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.04]">
            {pagedItems.map((tp: any) => {
              const hasUnpaidTax =
                !tp.payments ||
                tp.payments.length === 0 ||
                tp.payments.some((p: any) => !p.paymentMethod)

              return (
                <TableRow
                  key={tp.id}
                  className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]"
                >
                  <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-sm transition-all duration-200 ease-in-out">
                    #{tp.holding}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                    <p
                      onClick={() => router.push(`/tax-payers/${tp.id}`)}
                      className="font-bold text-foreground font-display text-base cursor-pointer hover:underline"
                    >
                      {tp.name}
                    </p>
                    {tp.fatherName && (
                      <p className="text-xs text-muted-foreground mt-0.5">পিতা: {tp.fatherName}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                    <p className="font-semibold text-foreground">
                      {tp.ward?.nameBn || tp.ward?.name || "N/A"}
                    </p>
                    <p className="text-muted-foreground mt-0.5">গ্রাম: {tp.village}</p>
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-right font-bold text-emerald-600 font-mono text-base transition-all duration-200 ease-in-out">
                    ৳{tp.tax?.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-muted-foreground transition-all duration-200 ease-in-out space-y-0.5 font-mono">
                    {tp.phone && <p>📱 {tp.phone}</p>}
                    {tp.nid && <p>🪪 NID: {tp.nid}</p>}
                    {!tp.phone && !tp.nid && <span>-</span>}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.04] cursor-pointer h-8 w-8"
                            title="অ্যাকশন"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[165px] text-popover-foreground"
                        >
                          <DropdownMenuItem
                            onClick={() => router.push(`/tax-payers/${tp.id}`)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>প্রোফাইল ও ইতিহাস</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openCardModal(tp)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                            <span>স্মার্ট কার্ড দেখুন</span>
                          </DropdownMenuItem>
                          {hasUnpaidTax && (
                            <DropdownMenuItem
                              onClick={() => handleCollectTax(tp)}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                            >
                              <Coins className="h-3.5 w-3.5" />
                              <span>কর আদায় করুন</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => router.push(`/tax-payers/${tp.id}/edit`)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                          >
                            <Pen className="h-3.5 w-3.5 text-blue-600" />
                            <span>সম্পাদনা</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(tp.id, tp.name)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>মুছে ফেলুন</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 bg-card/60 backdrop-blur-xs px-4 sm:px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            মোট <span className="font-bold text-foreground">{totalItems}</span> টির মধ্যে{" "}
            <span className="font-bold text-foreground">
              {displayStart}-{displayEnd}
            </span>{" "}
            দেখানো হচ্ছে
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">প্রতি পেজে:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(val) => {
                setItemsPerPage(Number(val) || 10)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 rounded-lg border border-border bg-muted/30 px-3 text-xs w-auto gap-1.5 text-foreground hover:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="প্রতি পেজে" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[90px] text-popover-foreground">
                <SelectItem value="5">৫</SelectItem>
                <SelectItem value="10">১০</SelectItem>
                <SelectItem value="20">২০</SelectItem>
                <SelectItem value="50">৫০</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="size-8 sm:size-9 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              onClick={() => setCurrentPage(pageNum)}
              className={`size-8 sm:size-9 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? "bg-primary text-primary-foreground font-extrabold shadow-sm shadow-primary/20 hover:bg-primary/90"
                  : "border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className="size-8 sm:size-9 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
