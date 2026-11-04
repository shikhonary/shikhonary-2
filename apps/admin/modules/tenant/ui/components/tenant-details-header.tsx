"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Mail, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { useToggleTenantStatus, useDeleteTenant } from "../../services/use-tenant"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"

interface TenantDetailsHeaderProps {
  isActive: boolean
  isSuspended: boolean
  tenantId: string
  tenantName: string
}

export function TenantDetailsHeader({
  isActive,
  isSuspended,
  tenantId,
  tenantName,
}: TenantDetailsHeaderProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const openInvitationModal = useInvitationModalStore((state) => state.openModal)

  const toggleStatusMutation = useToggleTenantStatus()
  const deleteMutation = useDeleteTenant()

  const handleToggle = () => {
    toggleStatusMutation.mutate({ id: tenantId })
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: tenantId })
      toast.success(`"${tenantName}" প্রতিষ্ঠানটি সফলভাবে মুছে ফেলা হয়েছে।`)
      setShowDeleteDialog(false)
      router.push("/tenants")
    } catch (err: any) {
      toast.error(err.message || "প্রতিষ্ঠান ডিলিট করতে ব্যর্থ হয়েছে")
    }
  }

  const handleInvite = () => {
    openInvitationModal(tenantId, tenantName)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tenants")}
          className="gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all -ml-2 text-xs sm:text-sm font-medium"
          title="তালিকায় ফিরে যান"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">তালিকায় ফিরে যান</span>
        </Button>

        <div className="flex items-center gap-2">
          {/* Edit Tenant Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/tenants/${tenantId}/edit`)}
            className="rounded-xl font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-1.5"
            title="তথ্য সম্পাদনা"
          >
            <Edit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline text-xs">সম্পাদনা</span>
          </Button>

          {/* Invite Member Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleInvite}
            className="rounded-xl font-medium border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-1.5"
            title="সদস্য আমন্ত্রণ"
          >
            <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline text-xs">সদস্য আমন্ত্রণ</span>
          </Button>

          {/* Activate/Deactivate Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={toggleStatusMutation.isPending}
            className={`rounded-xl border font-medium transition-all cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-1.5 ${
              isActive
                ? "border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100/50 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400"
                : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
            }`}
            title={isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
          >
            {isActive ? (
              <>
                <ToggleLeft className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline text-xs">নিষ্ক্রিয় করুন</span>
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline text-xs">সক্রিয় করুন</span>
              </>
            )}
          </Button>

          {/* Delete Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-xl font-medium border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30 cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-1.5"
            title="প্রতিষ্ঠান মুছে ফেলুন"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">মুছে ফেলুন</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="প্রতিষ্ঠানটি মুছে ফেলতে চান?"
        itemName={tenantName}
        warningText="এই প্রতিষ্ঠানটি মুছে ফেললে এর সমস্ত ডেটাবেস রেকর্ড, সদস্য এবং সাবস্ক্রিপশন তথ্য স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
