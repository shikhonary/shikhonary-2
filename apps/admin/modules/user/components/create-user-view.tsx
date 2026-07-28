"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@workspace/ui/components/sonner"
import { useCreateUser, useRolesForSelection } from "../services/use-user"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff } from "lucide-react"

const createUserFormSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
  name: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "Select at least one role"),
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

export function CreateUserView() {
  const router = useRouter()
  const createMutation = useCreateUser()
  const { data: roles = [], isLoading: isRolesLoading } = useRolesForSelection()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      email: "",
      password: "",
      phoneNumber: "",
      name: "",
      roleIds: [],
    },
  })

  const selectedRoleIds = watch("roleIds")
  const isSubmitting = createMutation.isPending || isFormSubmitting

  const onSubmit = async (data: CreateUserFormData) => {
    setErrorMessage(null)

    try {
      await createMutation.mutateAsync({
        name: data.name?.trim() || undefined,
        email: data.email.trim(),
        password: data.password,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        roleIds: data.roleIds,
      })

      toast.success("User credentials registered and verified successfully.")
      setTimeout(() => {
        router.push("/users")
      }, 1000)
    } catch (err: any) {
      const msg = err.message || "Failed to register user credentials"
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

  return (
    <div className="w-full max-w-4xl mx-auto">
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
            <span className="font-label-sm text-xs font-bold text-primary">Create New</span>
          </nav>
          <h2 className="mb-1.5 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary">
            New User Account
          </h2>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Create user records and configure initial portal access credentials.
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
              Profile Specifications
            </CardTitle>
            <p className="text-[11px] sm:text-xs font-body-md text-on-surface-variant mt-0.5">
              Enter user details, password, and assign workspace roles
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

              {/* Email */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Email Address
                </Label>
                <div className="group relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type="email"
                    disabled={isSubmitting}
                    placeholder="e.g. j.dunn@bec-edu.org"
                    {...register("email")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Login Password
                </Label>
                <div className="group relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmitting}
                    placeholder="Minimum 6 characters"
                    {...register("password")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-12 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg p-0 hover:bg-surface-container-high cursor-pointer flex items-center justify-center text-outline hover:text-on-surface select-none outline-hidden ring-0 border-0"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error">{errors.password.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                  Phone Number (Optional)
                </Label>
                <div className="group relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors h-4.5 w-4.5" />
                  <Input
                    type="text"
                    disabled={isSubmitting}
                    placeholder="e.g. +8801712345678"
                    {...register("phoneNumber")}
                    className="w-full rounded-lg border border-outline-variant py-2.5 sm:py-3 pl-10 pr-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-auto"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-error">{errors.phoneNumber.message}</p>
                )}
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
                  Assign one or more roles to this user.
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
                <span className="text-[12px]">New User Registration with Authentication</span>
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
                  <span>{isSubmitting ? "Creating..." : "Save User"}</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
