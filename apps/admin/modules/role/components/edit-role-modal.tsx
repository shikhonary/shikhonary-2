"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useRoleById, useUpdateRole } from "../services/use-role"
import { useEditRoleModalStore } from "../store/use-edit-role-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Shield, Loader2, Save } from "lucide-react"

const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
})

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>

export function EditRoleModal() {
  const { isOpen, roleId, closeModal } = useEditRoleModalStore()
  const { data: role, isLoading, isError } = useRoleById(roleId ?? "", isOpen && Boolean(roleId))
  const updateMutation = useUpdateRole()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Pre-fill form when role data is loaded
  useEffect(() => {
    if (role) {
      reset({
        name: role.name,
        description: role.description || "",
      })
    }
  }, [role, reset])

  const isSubmitting = updateMutation.isPending || isFormSubmitting

  const onSubmit = async (data: UpdateRoleFormData) => {
    if (!roleId) return
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: roleId,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      })

      toast.success("Role updated successfully.")
      closeModal()
    } catch (err: any) {
      const msg = err.message || "Failed to update role"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset()
      setErrorMessage(null)
      closeModal()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "600px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              Edit Role: {role?.name || "Loading..."}
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              Update name and details for this role
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-on-surface-variant">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 font-body-md text-sm">Loading role details...</span>
          </div>
        ) : isError || !role ? (
          <div className="p-8 text-center text-error">
            <span className="material-symbols-outlined text-4xl">error</span>
            <p className="mt-2 font-body-md font-medium">Failed to load role details.</p>
            <div className="mt-6">
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Textual Description */}
            <DialogHeader className="pt-1">
              <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
                Modify role details below. These changes will reflect immediately across all access layers.
              </DialogDescription>
            </DialogHeader>

            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-3 text-error">
                <span className="material-symbols-outlined text-lg">error</span>
                <span className="font-body-md text-xs font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
              {/* Role Name */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Role Name
                </Label>
                <Input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="e.g. Moderator"
                  {...register("name")}
                  className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
                />
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Description
                </Label>
                <Textarea
                  disabled={isSubmitting}
                  placeholder="Explain what access privileges users with this role possess..."
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden min-h-[80px]"
                />
                {errors.description && (
                  <p className="text-xs text-error">{errors.description.message}</p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t border-outline-variant/30">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                  className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Update Role</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
