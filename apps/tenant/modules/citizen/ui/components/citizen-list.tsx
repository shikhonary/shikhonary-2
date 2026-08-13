"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import {
  Loader2,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  MoreVertical,
  Trash2,
  Edit,
  Hash,
} from "lucide-react"

interface CitizenListProps {
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
  getIdentNo: (cit: any) => string
  getIdentType: (cit: any) => string
}

export function CitizenList({
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
}: CitizenListProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [actionCit, setActionCit] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation(
    trpc.citizen.delete.mutationOptions({
      onSuccess: () => {
        toast.success("নাগরিক তথ্য সফলভাবে মুছে ফেলা হয়েছে।")
        setDeleteDialogOpen(false)
        void queryClient.invalidateQueries()
        refetch()
      },
      onError: (err: any) => {
        toast.error(`মুছে ফেলতে ব্যর্থ হয়েছে: ${err.message}`)
      },
    })
  )

  const handleDelete = () => {
    if (!actionCit) return
    deleteMutation.mutate({ id: actionCit.id })
  }

  const displayStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border/60 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-semibold">নাগরিক তালিকা লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-rose-500 flex flex-col items-center gap-2 bg-card border border-border/60 rounded-2xl">
        <span>নাগরিক তালিকা লোড করতে সমস্যা হয়েছে।</span>
        <Button variant="outline" size="sm" onClick={refetch}>পুনরায় চেষ্টা করুন</Button>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2 bg-card border border-border/60 rounded-2xl">
        <Users className="w-10 h-10 text-muted-foreground/40" />
        <span className="text-sm font-semibold">কোনো নিবন্ধিত নাগরিক পাওয়া যায়নি।</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card List View (< md) */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:hidden">
        {pagedItems.map((cit) => (
          <div
            key={cit.id}
            className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:shadow-xs"
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground leading-snug">
                  {cit.nameBn}
                </h4>
                {cit.nameEn && (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {cit.nameEn}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20">
                  ID: {cit.citizenId}
                </span>
              </div>
            </div>

            {/* Address & Details */}
            <div className="space-y-2 border-t border-border/40 pt-2 font-body text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  ওয়ার্ড নং: {cit.presentAddress?.ward?.nameBn || cit.presentAddress?.ward?.name || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  বাসিন্দা: {cit.residentType === "PERMANENT" ? "স্থায়ী" : "অস্থায়ী"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{cit.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-muted-foreground shrink-0">{getIdentType(cit)}:</span>
                <span className="font-mono">{getIdentNo(cit)}</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8.5 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => onViewDetails(cit.id)}
              >
                <Eye className="h-4 w-4 mr-1 text-primary" />
                বিস্তারিত
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8.5 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => router.push(`/citizens/${cit.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1 text-primary" />
                সম্পাদনা
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8.5 rounded-lg text-muted-foreground hover:text-rose-500"
                onClick={() => {
                  setActionCit(cit)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4 mr-1 text-rose-500" />
                মুছে ফেলুন
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Grid Table View (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40 font-display">
            <TableRow className="border-b border-border/65">
              <TableHead className="py-4 pl-5 font-bold text-foreground text-xs lg:text-sm">Citizen ID</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-xs lg:text-sm">নাম</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-xs lg:text-sm">যোগাযোগ</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-xs lg:text-sm">পরিচিতি নথি</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-xs lg:text-sm">ওয়ার্ড</TableHead>
              <TableHead className="py-4 font-bold text-foreground text-xs lg:text-sm">বাসিন্দা ধরণ</TableHead>
              <TableHead className="py-4 pr-5 text-right font-bold text-foreground text-xs lg:text-sm">অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-body text-xs lg:text-sm">
            {pagedItems.map((cit) => (
              <TableRow
                key={cit.id}
                className="border-b border-border/50 hover:bg-muted/10 transition-colors"
              >
                {/* ID */}
                <TableCell className="py-4 pl-5 font-bold text-primary font-mono">{cit.citizenId}</TableCell>

                {/* Name */}
                <TableCell className="py-4">
                  <div className="font-semibold text-foreground">{cit.nameBn}</div>
                  {cit.nameEn && (
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{cit.nameEn}</div>
                  )}
                </TableCell>

                {/* Contact */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-1 text-foreground font-semibold font-mono">{cit.mobile}</div>
                  {cit.email && (
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{cit.email}</div>
                  )}
                </TableCell>

                {/* Identity */}
                <TableCell className="py-4">
                  <div className="text-[11px] text-muted-foreground font-semibold">{getIdentType(cit)}</div>
                  <div className="font-semibold font-mono text-xs text-foreground mt-0.5">{getIdentNo(cit)}</div>
                </TableCell>

                {/* Ward */}
                <TableCell className="py-4 font-semibold text-foreground">
                  {cit.presentAddress?.ward?.nameBn || cit.presentAddress?.ward?.name || "N/A"}
                </TableCell>

                {/* Resident Type */}
                <TableCell className="py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    cit.residentType === "PERMANENT"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }`}>
                    {cit.residentType === "PERMANENT" ? "স্থায়ী" : "অস্থায়ী"}
                  </span>
                </TableCell>

                {/* Dropdown Menu */}
                <TableCell className="py-4 pr-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg cursor-pointer">
                        <MoreVertical className="h-4.5 w-4.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border border-border shadow-md rounded-xl text-popover-foreground font-body text-xs">
                      <DropdownMenuItem
                        className="py-2.5 cursor-pointer flex items-center gap-2 rounded-lg"
                        onClick={() => onViewDetails(cit.id)}
                      >
                        <Eye className="w-4 h-4 text-primary" />
                        বিস্তারিত প্রোফাইল
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="py-2.5 cursor-pointer flex items-center gap-2 rounded-lg"
                        onClick={() => router.push(`/citizens/${cit.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 text-primary" />
                        তথ্য সংশোধন
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="py-2.5 cursor-pointer flex items-center gap-2 rounded-lg text-rose-500 focus:text-rose-500 hover:bg-rose-500/10"
                        onClick={() => {
                          setActionCit(cit)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        নাগরিকত্ব অপসারণ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/60 rounded-2xl p-4 font-body text-xs text-muted-foreground">
        <div>
          নাগরিক তালিকা {displayStart} থেকে {displayEnd} (সর্বমোট {totalItems} জন)
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>প্রতি পেজে:</span>
            <Select value={String(itemsPerPage)} onValueChange={(val) => {
              setItemsPerPage(Number(val))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-16 h-8 rounded-lg border-border bg-transparent text-xs">
                <SelectValue placeholder="১০" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border rounded-lg text-foreground">
                <SelectItem value="5">৫</SelectItem>
                <SelectItem value="10">১০</SelectItem>
                <SelectItem value="20">২০</SelectItem>
                <SelectItem value="50">৫০</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center font-bold px-2">
              পেজ {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-rose-500 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              নাগরিক তথ্য মুছে ফেলার নিশ্চয়তা
            </DialogTitle>
            <DialogDescription className="font-body text-muted-foreground text-sm pt-1.5">
              আপনি কি নিশ্চিতভাবে এই নাগরিকের বিবরণ মুছে ফেলতে চান? এই অ্যাকশনটি স্থায়ী এবং এটি পুনরুদ্ধার করা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 font-body">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              className="font-bold"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  মুছে ফেলা হচ্ছে...
                </>
              ) : (
                "হ্যাঁ, মুছে ফেলুন"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
