"use client"

import { useState, useEffect } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useUpdateUserRoles, useRolesForSelection } from "../services/use-user"
import { useChangeRoleModalStore } from "../store/use-change-role-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Shield, Loader2, Save } from "lucide-react"

export function ChangeRoleModal() {
  const { isOpen, userId, userName, currentRoleIds, closeModal } = useChangeRoleModalStore()
  const { data: roles = [], isLoading: isRolesLoading } = useRolesForSelection()
  const updateRolesMutation = useUpdateUserRoles()

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleIds(currentRoleIds)
    }
  }, [isOpen, currentRoleIds])

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds([...selectedRoleIds, roleId])
    } else {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId))
    }
  }

  const handleConfirmChange = async () => {
    if (!userId) return

    try {
      await updateRolesMutation.mutateAsync({
        userId,
        roleIds: selectedRoleIds,
      })
      toast.success(`Access roles for "${userName || "User"}" updated successfully.`)
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to update user roles")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "520px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Header Section */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              Manage Access Roles
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              Bind or unbind user workspace roles
            </p>
          </div>
        </div>

        {/* Textual Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            Update account access permissions for{" "}
            <span className="font-bold text-on-surface">
              &quot;{userName || "selected user"}&quot;
            </span>
            . Select one or more workspace roles below.
          </DialogDescription>
        </DialogHeader>

        {/* Roles List Checklist */}
        <div className="py-2">
          {isRolesLoading ? (
            <div className="flex items-center space-x-2 text-outline py-4 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs font-body-md">Loading workspace roles...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start space-x-3 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low transition-colors"
                >
                  <Checkbox
                    id={`modal-role-${role.id}`}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleToggle(role.id, !!checked)}
                    disabled={updateRolesMutation.isPending}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1 leading-none">
                    <label
                      htmlFor={`modal-role-${role.id}`}
                      className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-on-surface"
                    >
                      {role.name}
                    </label>
                    {role.description && (
                      <p className="text-[10px] text-outline leading-snug mt-0.5">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2 border-t border-outline-variant/30">
          <Button
            type="button"
            variant="outline"
            disabled={updateRolesMutation.isPending}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={updateRolesMutation.isPending}
            onClick={handleConfirmChange}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary-container px-5 py-2 text-xs font-bold text-on-primary-container hover:bg-primary hover:text-white cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50"
          >
            {updateRolesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Roles</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
