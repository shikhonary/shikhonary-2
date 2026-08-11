"use client"

import { Checkbox } from "@workspace/ui/components/checkbox"
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
  Users,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
  Phone,
  Coins,
} from "lucide-react"

interface TaxGenerationPreviewListProps {
  hasWardOrSearch: boolean
  isLoadingPreview: boolean
  filteredItems: any[]
  pendingItems: any[]
  selectedIds: Set<string>
  handleToggleSelectAll: (checked: boolean) => void
  handleToggleItem: (id: string) => void
  formatCurrency: (amount: number) => string
  formatNumber: (num: number) => string
}

export function TaxGenerationPreviewList({
  hasWardOrSearch,
  isLoadingPreview,
  filteredItems,
  pendingItems,
  selectedIds,
  handleToggleSelectAll,
  handleToggleItem,
  formatCurrency,
  formatNumber,
}: TaxGenerationPreviewListProps) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden font-body">
      <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <Users className="w-4 h-4 text-primary" />
          <span>করদাতা তালিকা প্রিভিউ ({formatNumber(filteredItems.length)})</span>
        </div>

        {pendingItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all-header"
              checked={
                pendingItems.length > 0 &&
                pendingItems.every((item) => selectedIds.has(item.id))
              }
              onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
            />
            <label
              htmlFor="select-all-header"
              className="text-xs font-bold text-muted-foreground cursor-pointer select-none"
            >
              সকল পেন্ডিং নির্বাচন করুন
            </label>
          </div>
        )}
      </div>

      {!hasWardOrSearch ? (
        <div className="p-12 text-center space-y-2">
          <MapPin className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="text-base font-bold text-foreground">
            ওয়ার্ড নির্বাচন করুন অথবা অনুসন্ধান টাইপ করুন
          </p>
          <p className="text-xs text-muted-foreground font-semibold">
            করদাতার বাৎসরিক কর নির্ধারণ ও জেনারেশনের জন্য যেকোনো একটি ওয়ার্ড নম্বর নির্বাচন করুন বা সন্ধান করুন।
          </p>
        </div>
      ) : isLoadingPreview ? (
        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">
            করদাতা তালিকা হিসাব করা হচ্ছে...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <p className="text-base font-bold text-foreground">কোনো করদাতা পাওয়া যায়নি</p>
          <p className="text-xs text-muted-foreground font-semibold">
            ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="divide-y divide-border/60 md:hidden">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.has(item.id)
              const isDisabled = item.alreadyGenerated || item.annualTax <= 0

              return (
                <div
                  key={item.id}
                  className={`p-4 space-y-3 transition-colors ${
                    item.alreadyGenerated
                      ? "bg-muted/20 opacity-70"
                      : isSelected
                      ? "bg-primary/5 dark:bg-primary/10"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                            #{item.holding}
                          </span>
                          <h4 className="font-display text-sm font-extrabold text-foreground truncate">
                            {item.name}
                          </h4>
                        </div>
                        {item.fatherName && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate font-body">
                            পিতা: {item.fatherName}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.alreadyGenerated ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold text-[10px] gap-1 shrink-0"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>জেনারেটকৃত</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold text-[10px] gap-1 shrink-0"
                      >
                        <Clock className="w-3 h-3" />
                        <span>জেনারেশন বাকি</span>
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {item.wardName} - {item.village}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-primary font-bold font-mono">
                      <Coins className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatCurrency(item.annualTax)}</span>
                    </div>
                    {item.phone && (
                      <div className="flex items-center gap-1.5 text-muted-foreground font-mono col-span-2">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{item.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12 text-center">নির্বাচন</TableHead>
                  <TableHead className="font-bold">হোল্ডিং নং</TableHead>
                  <TableHead className="font-bold">করদাতার নাম</TableHead>
                  <TableHead className="font-bold">ওয়ার্ড</TableHead>
                  <TableHead className="font-bold">গ্রাম</TableHead>
                  <TableHead className="font-bold text-right">বাৎসরিক কর</TableHead>
                  <TableHead className="font-bold text-center">অবস্থা</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id)
                  const isDisabled = item.alreadyGenerated || item.annualTax <= 0

                  return (
                    <TableRow
                      key={item.id}
                      className={
                        item.alreadyGenerated
                          ? "bg-muted/20 opacity-70"
                          : isSelected
                          ? "bg-primary/5 dark:bg-primary/10"
                          : undefined
                      }
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => handleToggleItem(item.id)}
                        />
                      </TableCell>

                      <TableCell className="font-black text-foreground">
                        {item.holding}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{item.name}</span>
                          {item.fatherName && (
                            <span className="text-xs text-muted-foreground">
                              পিতা: {item.fatherName}
                            </span>
                          )}
                          {item.phone && (
                            <span className="text-xs text-muted-foreground font-mono">
                              ফোন: {item.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-muted-foreground font-display">
                        {item.wardName}
                      </TableCell>

                      <TableCell className="font-semibold text-muted-foreground">
                        {item.village}
                      </TableCell>

                      <TableCell className="text-right font-black text-foreground font-mono">
                        {formatCurrency(item.annualTax)}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.alreadyGenerated ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>জেনারেটকৃত</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>জেনারেশন বাকি</span>
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
