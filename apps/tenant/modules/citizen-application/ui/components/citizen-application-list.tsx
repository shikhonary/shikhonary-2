"use client"

import { Button } from "@workspace/ui/components/button"
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
  Loader2,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

const statusMap: Record<string, { label: string; badgeClass: string; icon: any }> = {
  PENDING: { label: "পেন্ডিং", badgeClass: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20", icon: Clock },
  APPROVED: { label: "অনুমোদিত", badgeClass: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20", icon: CheckCircle },
  REJECTED: { label: "প্রত্যাখ্যাত", badgeClass: "bg-rose-500/10 text-rose-500 border border-rose-500/20", icon: XCircle },
}

interface CitizenApplicationListProps {
  pagedItems: any[]
  totalItems: number
  itemsPerPage: number
  setItemsPerPage: (val: number) => void
  currentPage: number
  setCurrentPage: (val: number | ((prev: number) => number)) => void
  totalPages: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
  onViewDetails: (id: string) => void
  getIdentNo: (app: any) => string
  getIdentType: (app: any) => string
}

export function CitizenApplicationList({
  pagedItems,
  totalItems,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  isLoading,
  isError,
  refetch,
  onViewDetails,
  getIdentNo,
  getIdentType,
}: CitizenApplicationListProps) {
  return (
    <div className="space-y-4 font-body">
      {/* Applications Table Card */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground font-semibold">আবেদনসমূহ লোড হচ্ছে...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-rose-500 flex flex-col items-center gap-2">
            <span>তথ্য লোড করতে সমস্যা হয়েছে।</span>
            <Button variant="outline" size="sm" onClick={refetch}>পুনরায় চেষ্টা করুন</Button>
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
            <span className="text-sm font-semibold">কোনো আবেদন পাওয়া যায়নি।</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-bold py-3.5">আবেদনকারীর নাম</TableHead>
                  <TableHead className="text-xs font-bold py-3.5">সনাক্তকরণ নথি</TableHead>
                  <TableHead className="text-xs font-bold py-3.5">মোবাইল নম্বর</TableHead>
                  <TableHead className="text-xs font-bold py-3.5">ওয়ার্ড নং</TableHead>
                  <TableHead className="text-xs font-bold py-3.5">আবেদনের তারিখ</TableHead>
                  <TableHead className="text-xs font-bold py-3.5">স্ট্যাটাস</TableHead>
                  <TableHead className="text-xs font-bold py-3.5 text-right">পদক্ষেপ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedItems.map((app) => {
                  const StatusIcon = statusMap[app.status]?.icon || ClipboardList
                  return (
                    <TableRow key={app.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="py-3">
                        <span className="font-semibold text-sm text-foreground block">{app.nameBn}</span>
                        {app.nameEn && (
                          <span className="text-[11px] text-muted-foreground font-mono block leading-none pt-0.5">{app.nameEn}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-[11px] text-muted-foreground block leading-none pb-0.5">{getIdentType(app)}</span>
                        <span className="font-mono text-xs font-bold text-foreground">{getIdentNo(app)}</span>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-semibold text-foreground">
                        {app.mobile}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-bold text-foreground">
                        ওয়ার্ড {app.presentAddress.ward?.nameBn || app.presentAddress.ward?.name || "N/A"}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                        {new Date(app.createdAt).toLocaleDateString("bn-BD")}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${statusMap[app.status]?.badgeClass || "bg-muted"}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusMap[app.status]?.label || app.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(app.id)}
                          className="hover:bg-muted hover:text-primary rounded-lg text-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          বিস্তারিত
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && !isLoading && (
        <div className="bg-card px-4 py-3.5 border border-border/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
            <span>আবেদন মোট {totalItems} টি</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span>প্রতি পৃষ্ঠা:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-7 w-[65px] bg-muted/30 border-border/80 text-xs focus:ring-0 focus:ring-offset-0 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">১০</SelectItem>
                  <SelectItem value="20">২০</SelectItem>
                  <SelectItem value="50">৫০</SelectItem>
                  <SelectItem value="100">১০০</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="w-8 h-8 rounded-lg hover:bg-muted border-border/80 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold text-foreground">
              পৃষ্ঠা {currentPage.toLocaleString("bn-BD")} / {totalPages.toLocaleString("bn-BD")}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="w-8 h-8 rounded-lg hover:bg-muted border-border/80 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
