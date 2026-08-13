"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
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
  Loader2,
  ClipboardList,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  MoreVertical,
  Trash2,
  Info,
  FileText,
  Printer,
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const [actionApp, setActionApp] = useState<any | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const approveMutation = useMutation(
    trpc.citizenApplication.approve.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে অনুমোদিত হয়েছে এবং নাগরিককে তালিকাভুক্ত করা হয়েছে।")
        setApproveDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        refetch()
      },
      onError: (err: any) => {
        toast.error(`অনুমোদনে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const rejectMutation = useMutation(
    trpc.citizenApplication.reject.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি প্রত্যাখ্যাত করা হয়েছে।")
        setRejectDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        refetch()
      },
      onError: (err: any) => {
        toast.error(`প্রত্যাখ্যানে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const deleteMutation = useMutation(
    trpc.citizenApplication.delete.mutationOptions({
      onSuccess: () => {
        toast.success("আবেদনটি সফলভাবে মুছে ফেলা হয়েছে।")
        setDeleteDialogOpen(false)
        void queryClient.invalidateQueries(trpc.citizenApplication.pathFilter())
        refetch()
      },
      onError: (err: any) => {
        toast.error(`মুছে ফেলতে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const handleApprove = () => {
    if (!actionApp) return
    approveMutation.mutate({ id: actionApp.id })
  }

  const handleReject = () => {
    if (!actionApp) return
    rejectMutation.mutate({ id: actionApp.id, rejectionReason: rejectionReason.trim() || undefined })
  }

  const handleDelete = () => {
    if (!actionApp) return
    deleteMutation.mutate({ id: actionApp.id })
  }

  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border/60 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-semibold">আবেদনসমূহ লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-rose-500 flex flex-col items-center gap-2 bg-card border border-border/60 rounded-2xl">
        <span>তথ্য লোড করতে সমস্যা হয়েছে।</span>
        <Button variant="outline" size="sm" onClick={refetch}>পুনরায় চেষ্টা করুন</Button>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2 bg-card border border-border/60 rounded-2xl">
        <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
        <span className="text-sm font-semibold">কোনো আবেদন পাওয়া যায়নি।</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {pagedItems.map((app) => {
          const StatusIcon = statusMap[app.status]?.icon || Clock
          return (
            <div
              key={app.id}
              className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20 shadow-xs">
                    <User className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => onViewDetails(app.id)}
                      className="font-display text-base font-extrabold text-foreground truncate cursor-pointer hover:underline"
                    >
                      {app.nameBn}
                    </h4>
                    {app.nameEn && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">
                        {app.nameEn}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${statusMap[app.status]?.badgeClass || "bg-muted"}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusMap[app.status]?.label || app.status}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer h-8 w-8"
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
                        onClick={() => router.push(`/citizen-applications/${app.id}`)}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>বিস্তারিত বিবরণী</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => window.open(`/citizen-applications/${app.id}/preview`, "_blank")}
                        className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                      >
                        <Printer className="h-3.5 w-3.5 text-primary" />
                        <span>আবেদনপত্র প্রিন্ট (PDF)</span>
                      </DropdownMenuItem>

                      {(app.status === "PENDING" || app.status === "REJECTED") && (
                        <DropdownMenuItem
                          onClick={() => {
                            setActionApp(app)
                            setApproveDialogOpen(true)
                          }}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          <span>অনুমোদন করুন</span>
                        </DropdownMenuItem>
                      )}

                      {app.status === "PENDING" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setActionApp(app)
                            setRejectionReason("")
                            setRejectDialogOpen(true)
                          }}
                          className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10"
                        >
                          <XCircle className="h-3.5 w-3.5 text-rose-600" />
                          <span>প্রত্যাখ্যান করুন</span>
                        </DropdownMenuItem>
                      )}


                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-border/50 font-body">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">ওয়ার্ড {app.presentAddress.ward?.nameBn || app.presentAddress.ward?.name || "N/A"}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 text-muted-foreground font-mono">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{new Date(app.createdAt).toLocaleDateString("bn-BD")}</span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{app.mobile}</span>
                </div>

                <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground font-mono pt-1">
                  <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{getIdentType(app)}: {getIdentNo(app)}</span>
                </div>

                <div className="col-span-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onViewDetails(app.id)}
                    className="w-full h-9 text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-xl gap-1.5 shadow-xs cursor-pointer border border-primary/20"
                  >
                    <Eye className="h-4 w-4" />
                    <span>বিস্তারিত দেখুন</span>
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <Table className="w-full text-left font-body">
          <TableHeader className="bg-white/[0.02] border-b border-white/[0.05]">
            <TableRow className="border-b border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">আবেদনকারী</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">সনাক্তকরণ নথি</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">যোগাযোগ</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">ওয়ার্ড নং</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">আবেদনের তারিখ</TableHead>
              <TableHead className="px-6 py-4 font-semibold text-muted-foreground text-xs h-auto">স্ট্যাটাস</TableHead>
              <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground text-xs h-auto">পদক্ষেপ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-white/[0.04]">
            {pagedItems.map((app) => {
              const StatusIcon = statusMap[app.status]?.icon || Clock
              return (
                <TableRow
                  key={app.id}
                  className="hover:bg-white/[0.02] transition-all duration-200 ease-in-out group border-b border-white/[0.04]"
                >
                  <TableCell className="py-4 group-hover:py-5 px-6 text-foreground transition-all duration-200 ease-in-out">
                    <span
                      onClick={() => onViewDetails(app.id)}
                      className="font-bold text-foreground font-display text-base block cursor-pointer hover:underline"
                    >
                      {app.nameBn}
                    </span>
                    {app.nameEn && (
                      <span className="text-[11px] text-muted-foreground font-mono block leading-none pt-0.5">{app.nameEn}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-foreground transition-all duration-200 ease-in-out">
                    <span className="text-muted-foreground block leading-none pb-0.5">{getIdentType(app)}</span>
                    <span className="font-mono text-xs font-bold text-foreground">{getIdentNo(app)}</span>
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs font-semibold text-foreground transition-all duration-200 ease-in-out">
                    {app.mobile}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs font-bold text-foreground transition-all duration-200 ease-in-out">
                    ওয়ার্ড {app.presentAddress.ward?.nameBn || app.presentAddress.ward?.name || "N/A"}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 text-xs text-muted-foreground font-mono transition-all duration-200 ease-in-out">
                    {new Date(app.createdAt).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell className="py-4 group-hover:py-5 px-6 transition-all duration-200 ease-in-out">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full inline-flex items-center gap-1 ${statusMap[app.status]?.badgeClass || "bg-muted"}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusMap[app.status]?.label || app.status}
                    </span>
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
                            onClick={() => router.push(`/citizen-applications/${app.id}`)}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            <span>বিস্তারিত বিবরণী</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => window.open(`/citizen-applications/${app.id}/preview`, "_blank")}
                            className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted focus:bg-muted"
                          >
                            <Printer className="h-3.5 w-3.5 text-primary" />
                            <span>আবেদনপত্র প্রিন্ট (PDF)</span>
                          </DropdownMenuItem>

                          {(app.status === "PENDING" || app.status === "REJECTED") && (
                            <DropdownMenuItem
                              onClick={() => {
                                setActionApp(app)
                                setApproveDialogOpen(true)
                              }}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              <span>অনুমোদন করুন</span>
                            </DropdownMenuItem>
                          )}

                          {app.status === "PENDING" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setActionApp(app)
                                setRejectionReason("")
                                setRejectDialogOpen(true)
                              }}
                              className="cursor-pointer gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10"
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>প্রত্যাখ্যান করুন</span>
                            </DropdownMenuItem>
                          )}


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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 bg-card/60 backdrop-blur-xs px-4 sm:px-6 py-4 rounded-2xl border border-border/80 shadow-xs">
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
              <SelectTrigger className="h-8 rounded-lg border border-border bg-muted/30 px-3 text-xs w-auto gap-1.5 text-foreground hover:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 transition-all font-bold">
                <SelectValue placeholder="প্রতি পেজে" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-xl rounded-xl min-w-[90px] text-popover-foreground">
                <SelectItem value="5">৫</SelectItem>
                <SelectItem value="10">১০</SelectItem>
                <SelectItem value="20">২০</SelectItem>
                <SelectItem value="50">৫০</SelectItem>
                <SelectItem value="100">১০০</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev: any) => typeof prev === "function" ? prev(currentPage) - 1 : prev - 1)}
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
            onClick={() => setCurrentPage((prev: any) => typeof prev === "function" ? prev(currentPage) + 1 : prev + 1)}
            className="size-8 sm:size-9 rounded-lg border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={(open) => !open && setApproveDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-600/90 to-emerald-500 p-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-white">
                  আবেদন অনুমোদন করবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-white/90 mt-0.5 font-medium">
                  অনুমোদনের পূর্বে তথ্য যাচাই করে নিন
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{actionApp?.nameBn || "নির্বাচিত আবেদন"}&quot;
              </span>{" "}
              এর আবেদনটি অনুমোদন করতে চান?
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                অনুমোদনের পর আবেদনকারীর বিবরণ ইউনিয়ন পরিষদের স্থায়ী নাগরিক তালিকাভুক্ত হবে এবং এই তথ্য পরিবর্তন করা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={approveMutation.isPending}
                onClick={() => setApproveDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={approveMutation.isPending}
                onClick={handleApprove}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {approveMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>অনুমোদন হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    <span>অনুমোদন করুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(open) => !open && setRejectDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-red-600 via-red-600/90 to-red-500 p-6 text-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white shrink-0 shadow-sm">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-white">
                  আবেদন প্রত্যাখ্যান করবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-white/90 mt-0.5 font-medium">
                  প্রত্যাখ্যানের কারণ উল্লেখ করুন
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                প্রত্যাখ্যানের কারণ (ঐচ্ছিক)
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Textarea
                  placeholder="যেমন: ভুল NID বা অস্পষ্ট ছবি প্রদান করা হয়েছে..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px] bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 pt-3 rounded-xl text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={rejectMutation.isPending}
                onClick={() => setRejectDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={handleReject}
                className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {rejectMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>প্রত্যাখ্যান হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    <span>প্রত্যাখ্যান করুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0 gap-0">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="font-display text-lg font-bold text-primary-foreground">
                  আবেদন মুছে ফেলবেন?
                </DialogTitle>
                <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  এই প্রক্রিয়া নিশ্চিতকরণ আবশ্যক
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 font-body">
            <p className="font-body text-sm leading-relaxed text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি{" "}
              <span className="font-bold text-foreground">
                &quot;{actionApp?.nameBn || "নির্বাচিত আবেদন"}&quot;
              </span>{" "}
              মুছে ফেলতে চান?
            </p>

            <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p className="leading-snug">
                এই প্রক্রিয়াটি স্থায়ী এবং মুছে ফেলার পর পুনরায় ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeleteDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    <span>আবেদন মুছুন</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
