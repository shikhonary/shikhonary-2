"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import {
  useUserById,
  useUpdateUser,
  useUpdateUserRoles,
  useRolesForSelection,
} from "../services/use-user"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { User, Mail, Phone, Shield } from "lucide-react"

const editUserFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleIds: z.array(z.string()).min(1, "Select at least one role"),
})

type EditUserFormData = z.infer<typeof editUserFormSchema>

interface EditUserViewProps {
  userId: string
}

export function EditUserView({ userId }: EditUserViewProps) {
  const router = useRouter()
  const { data: user, isLoading, isError } = useUserById(userId)
  const { data: roles = [], isLoading: isRolesLoading } = useRolesForSelection()

  const updateUserMutation = useUpdateUser()
  const updateUserRolesMutation = useUpdateUserRoles()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      name: "",
      roleIds: [],
    },
  })

  // Pre-fill form when user data finishes loading
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        roleIds: user.roles.map((r) => r.id),
      })
    }
  }, [user, reset])

  const selectedRoleIds = watch("roleIds")
  const isSubmitting =
    updateUserMutation.isPending ||
    updateUserRolesMutation.isPending ||
    isFormSubmitting

  const onSubmit = async (data: EditUserFormData) => {
    setErrorMessage(null)

    try {
      // Run profile update and roles assignment concurrently
      await Promise.all([
        updateUserMutation.mutateAsync({
          id: userId,
          name: data.name.trim(),
        }),
        updateUserRolesMutation.mutateAsync({
          userId,
          roleIds: data.roleIds,
        }),
      ])

      toast.success("User updated successfully.")
      setTimeout(() => {
        router.push("/users")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to update user profile"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setValue("roleIds", [...selectedRoleIds, roleId])
    } else {
      setValue("roleIds", selectedRoleIds.filter(id => id !== roleId))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
        <span className="ml-3 font-body-md text-sm">Loading user account details...</span>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="mx-auto max-w-2xl p-8 sm:p-12 text-center">
        <span className="material-symbols-outlined text-4xl sm:text-5xl text-error">error</span>
        <h3 className="mt-4 font-headline-md text-lg sm:text-xl font-bold text-on-surface">
          User Account Not Found
        </h3>
        <p className="mt-2 font-body-md text-xs sm:text-sm text-on-surface-variant">
          The requested user account details could not be loaded.
        </p>
        <div className="mt-6">
          <Button
            type="button"
            onClick={() => router.push("/users")}
            className="rounded-lg bg-primary px-6 py-2.5 font-bold text-white hover:bg-primary/90 h-auto normal-case tracking-normal text-sm"
          >
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header Section */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div className="max-w-2xl">
          <nav className="mb-3 flex items-center space-x-2 text-on-surface-variant">
            <Link
              href="/users"
              className="font-label-sm text-xs hover:text-primary transition-colors cursor-pointer"
            >
              Users
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="font-label-sm text-xs font-bold text-primary">Edit Profile</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            Edit Profile: {user.name || user.email}
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Update specifications and edit role access bindings for this user.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error-container/20 p-4 text-error">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="font-body-md text-xs sm:text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-outline-variant bg-white p-0 shadow-xs ring-0">
        <CardHeader className="border-b border-outline-variant/40 bg-surface-container-lowest p-4 sm:p-8 flex flex-row items-center gap-3 sm:gap-4">
          <div className="flex size-10 sm:size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <CardTitle className="font-headline-md text-base sm:text-[20px] font-extrabold text-on-surface normal-case tracking-normal">
              Profile Details
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Modify account name and select platform-wide credentials and permission levels
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Full Name
                </Label>
                <div className="group relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. Jameson Dunn"
                    {...register("name")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant opacity-70">
                  Email Address (Verified)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4.5 w-4.5" />
                  <Input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-outline transition-all bg-surface-container-low h-auto cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number (Read-Only) */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant opacity-70">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline h-4.5 w-4.5" />
                  <Input
                    type="text"
                    disabled
                    value={user.phoneNumber || ""}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-outline transition-all bg-surface-container-low h-auto cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Roles Checklist */}
            <div className="space-y-4 border-t border-outline-variant/40 pt-6">
              <div>
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Shield className="h-4.5 w-4.5 text-primary" />
                  Access Roles
                </Label>
                <p className="text-[11px] font-body-md text-outline mt-0.5">
                  Manage the access roles bounds for this user. Select one or more roles.
                </p>
              </div>

              {isRolesLoading ? (
                <div className="flex items-center space-x-2 text-outline py-2">
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span className="text-xs">Loading roles...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-start space-x-3 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low transition-colors"
                    >
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.id, !!checked)}
                        disabled={isSubmitting}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {role.name}
                        </label>
                        {role.description && (
                          <p className="text-[10px] text-outline leading-snug">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.roleIds && (
                <p className="text-xs text-error">{errors.roleIds.message}</p>
              )}
            </div>

            {/* Meta & Actions */}
            <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant pt-6 sm:pt-8">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-[12px]">
                  Last updated:{" "}
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => router.push("/users")}
                  className="w-full sm:w-auto rounded-lg border border-outline px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-primary transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer h-auto normal-case tracking-normal disabled:opacity-50 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-lg bg-primary-container px-8 sm:px-10 py-2.5 sm:py-3 font-bold text-on-primary-container shadow-md transition-all active:scale-95 hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer h-auto normal-case tracking-normal text-sm"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px] sm:text-[20px]">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">save</span>
                  )}
                  <span>{isSubmitting ? "Updating..." : "Update User"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
