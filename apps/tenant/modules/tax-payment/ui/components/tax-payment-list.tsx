"use client"

import Link from "next/link"
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
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  Coins,
  Printer,
  Clock,
  CheckCircle2,
  Phone,
  CreditCard,
} from "lucide-react"

import { useTaxPaymentModalStore } from "../store/use-tax-payment-modal-store"
import { useDeleteTaxPaymentModalStore } from "../store/use-delete-tax-payment-modal-store"

interface TaxPaymentListProps {
  pagedItems: any[]
  totalItems: number
  displayStart: number
  displayEnd: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  setCurrentPage: (val: number) => void
}

export function TaxPaymentList({
  pagedItems,
  totalItems,
  displayStart,
  displayEnd,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
}: TaxPaymentListProps) {
  const { openModal: openPaymentModal } = useTaxPaymentModalStore()
  const { openModal: openDeleteModal } = useDeleteTaxPaymentModalStore()

  if (pagedItems.length === 0) return null

  return (
    <div>
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {pagedItems.map((pm: any) => {
          const isPaid = pm.paymentMethod !== null && pm.paymentMethod !== ""

          return (
            <div
              key={pm.id}
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
                        #{pm.taxPayer?.holding}
                      </span>
                      <h4 className="font-display text-base font-extrabold text-foreground truncate">
                        {pm.taxPayer?.name}
                      </h4>
                    </div>
                    {pm.taxPayer?.fatherName && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                        পিতা: {pm.taxPayer.fatherName}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 font-mono">
                      রসিদ/দাবি: <span className="font-bold text-foreground">{pm.receiptNo || "N/A"}</span>
                    </p>
                  </div>
                </div>

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
                    {isPaid ? (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/tax-collection/receipt/${pm.id}/preview`}
                          target="_blank"
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>রসিদ প্রিন্ট করুন</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => openPaymentModal(pm.taxPayer)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>কর আদায় করুন</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => openDeleteModal(pm)}
                      className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>মুছে ফেলুন</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {pm.taxPayer?.ward?.nameBn || pm.taxPayer?.ward?.name || "N/A"}
                    {pm.taxPayer?.village ? ` - ${pm.taxPayer.village}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold font-mono">
                  <Coins className="h-3.5 w-3.5 shrink-0" />
                  <span>৳{pm.amount?.toLocaleString()}</span>
                </div>

                {pm.taxPayer?.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{pm.taxPayer.phone}</span>
                  </div>
                )}
                {pm.taxPayer?.nid && (
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                    <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{pm.taxPayer.nid}</span>
                  </div>
                )}

                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-border/30 mt-1">
                  <span className="text-muted-foreground text-[11px]">
                    অর্থবছর: {pm.fiscalYear?.year} • {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                  </span>
                  {isPaid ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>পরিশোধিত ({pm.paymentMethod})</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      <span>অপরিশোধিত (দাবি)</span>
                    </Badge>
                  )}
                </div>

                {!isPaid && (
                  <div className="col-span-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => openPaymentModal(pm.taxPayer)}
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
                রসিদ / দাবি নং
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                করদাতার নাম ও হোল্ডিং
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                অর্থবছর & ওয়ার্ড
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">
                তারিখ & অবস্থা
              </TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto text-right">
                করের পরিমাণ
              </TableHead>
              <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">
                অ্যাকশন
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.04]">
            {pagedItems.map((pm: any) => {
              const isPaid = pm.paymentMethod !== null && pm.paymentMethod !== ""

              return (
                <TableRow
                  key={pm.id}
                  className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]"
                >
                  <TableCell className="py-4 group-hover:py-5 px-6 font-bold text-primary font-mono text-sm transition-all duration-200 ease-in-out">
                    {pm.receiptNo || "N/A"}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                    <p className="font-bold text-foreground font-display text-base">
                      {pm.taxPayer?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      হোল্ডিং #{pm.taxPayer?.holding}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                    <p className="font-semibold text-foreground">{pm.fiscalYear?.year}</p>
                    <p className="text-muted-foreground mt-0.5">
                      ওয়ার্ড: {pm.taxPayer?.ward?.nameBn || pm.taxPayer?.ward?.name}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                    <p className="font-medium">
                      {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                    </p>
                    {isPaid ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1 mt-0.5"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>পরিশোধিত ({pm.paymentMethod})</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold gap-1 mt-0.5"
                      >
                        <Clock className="w-3 h-3" />
                        <span>অপরিশোধিত (দাবি)</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-right font-bold text-emerald-600 font-mono text-base transition-all duration-200 ease-in-out">
                    ৳{pm.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-right transition-all duration-200 ease-in-out">
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
                        className="bg-popover border border-border shadow-xl rounded-2xl p-1.5 min-w-[160px] text-popover-foreground"
                      >
                        {isPaid ? (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/tax-collection/receipt/${pm.id}/preview`}
                              target="_blank"
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>রসিদ প্রিন্ট করুন</span>
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => openPaymentModal(pm.taxPayer)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                          >
                            <Coins className="h-3.5 w-3.5" />
                            <span>কর আদায় করুন</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(pm)}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>মুছে ফেলুন</span>
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
