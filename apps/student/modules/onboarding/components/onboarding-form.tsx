"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { useCurrentUser } from "@/modules/user/services/use-user"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const ENGLISH_REGEX = /^[A-Za-z\s.\-]+$/

const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .regex(ENGLISH_REGEX, "Please enter your name in English (e.g. Abdullah Al Mamun)"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "")
        return digits.length === 10 || digits.length === 11
      },
      { message: "Enter a valid 10 or 11-digit phone number" }
    ),
  institute: z.string().min(1, "Institute name is required"),
  academicClassId: z.string().min(1, "Please select your class"),
  roll: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true
        const num = Number(val)
        return !isNaN(num) && Number.isInteger(num) && num > 0
      },
      { message: "Roll number must be a positive integer" }
    ),
  isOfflineStudent: z.boolean(),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

// ─── Shared input / select classes using theme tokens ────────────────────────
const inputCls =
  "h-10 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-9 pr-3 text-sm text-on-surface outline-none transition-all duration-150 placeholder:text-on-surface-variant/50 hover:border-outline focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"

const selectTriggerCls =
  "h-10 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-low pl-9 pr-3 text-sm text-on-surface transition-all duration-150 hover:border-outline focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 data-[placeholder]:text-on-surface-variant/50 justify-between"

// ─── Reusable field wrapper ───────────────────────────────────────────────────
function Field({
  label,
  icon,
  error,
  required,
  children,
}: {
  label: string
  icon: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      <div className="group relative w-full min-w-0">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline transition-colors duration-150 group-focus-within:text-primary">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-error">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

// Steps for the sidebar progress
const STEPS = ["Account", "Profile", "Class"]

export function OnboardingForm() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { user } = useCurrentUser()

  const academicClassesQuery = useQuery(
    trpc.academicClass.forSelection.queryOptions({})
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      phone: "",
      institute: "",
      academicClassId: "",
      roll: "",
      isOfflineStudent: false,
    },
  })

  const selectedClassId = watch("academicClassId")
  const selectedClass = academicClassesQuery.data?.find(
    (cls) => cls.id === selectedClassId
  )
  const shouldShowRoll = selectedClass?.name?.startsWith("SSC") || false

  useEffect(() => {
    if (!shouldShowRoll) {
      setValue("roll", "")
    }
  }, [shouldShowRoll, setValue])

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phoneNumber || "",
        institute: "",
        academicClassId: "",
        roll: "",
        isOfflineStudent: false,
      })
    }
  }, [user, reset])

  const queryClient = useQueryClient()

  const completeMutation = useMutation(
    trpc.student.completeOnboarding.mutationOptions({
      onSuccess: async (data) => {
        if (data) {
          queryClient.setQueryData(trpc.student.getProfile.queryKey(), data)
        }
        await Promise.all([
          queryClient.invalidateQueries(trpc.user.pathFilter()),
          queryClient.invalidateQueries(trpc.student.pathFilter()),
        ])
        toast.success("Profile created! Redirecting to your dashboard…")
        setErrorMsg(null)
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1200)
      },
      onError: (err) => {
        const msg = err.message || "Failed to complete onboarding. Please try again."
        setErrorMsg(msg)
        toast.error(msg)
      },
    })
  )

  const isPending = completeMutation.isPending || isFormSubmitting

  const onSubmit = (data: OnboardingFormValues) => {
    setErrorMsg(null)
    completeMutation.mutate({
      name: data.name.trim(),
      phone: data.phone.trim(),
      institute: data.institute.trim(),
      academicClassId: data.academicClassId,
      roll: shouldShowRoll && data.roll && data.roll.trim() !== "" ? parseInt(data.roll, 10) : null,
      isOfflineStudent: data.isOfflineStudent,
    })
  }

  return (
    <div className="flex min-h-screen bg-surface">

      {/* ── Left branding panel (desktop only) ─────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[360px] xl:w-[400px] flex-shrink-0 flex-col justify-between bg-primary p-10 text-white">
        {/* Logo mark + brand name */}
        <div>
          <div className="mb-10 flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Mr. Dr. Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-sm bg-white"
              width={100}
              height={100}
              priority
            />
            <span className="text-2xl font-extrabold tracking-tight text-white">Mr. Dr.</span>
          </div>

          {/* Personalised headline */}
          <h2 className="mb-3 text-3xl font-extrabold leading-tight text-white">
            Welcome aboard,{" "}
            <span className="text-white/85">
              {user?.name?.split(" ")[0] || "Student"}!
            </span>
          </h2>
          <p className="text-sm leading-relaxed text-white/80">
            Complete your profile to unlock your personalised dashboard, track your progress, and access all learning materials.
          </p>

          {/* Step indicator */}
          <div className="mt-10 space-y-4">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-white">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 1
                      ? "bg-white text-primary"
                      : "border border-white/30 text-white/50"
                    }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm ${i === 1 ? "font-semibold text-white" : "text-white/60"
                    }`}
                >
                  {step}
                </span>
                {i === 1 && (
                  <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <blockquote className="border-l-2 border-white/30 pl-4 text-sm italic text-white/80">
          "Education is the most powerful weapon which you can use to change the world."
          <footer className="mt-1 not-italic text-white/60">— Nelson Mandela</footer>
        </blockquote>
      </aside>

      {/* ── Right form panel ────────────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center p-3 pt-6 pb-28 sm:p-8 lg:pb-8">
        <div className="w-full max-w-lg min-w-0">

          {/* Mobile logo (hidden on desktop since sidebar shows branding) */}
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <Image
              src="/logo.jpg"
              alt="Mr. Dr. Logo"
              className="w-14 h-14 rounded-2xl object-cover shadow-md bg-white"
              width={100}
              height={100}
              priority
            />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-primary tracking-tight leading-none">Mr. Dr.</div>
              <div className="text-[10px] font-semibold text-on-surface-variant/60 tracking-widest uppercase mt-1">Student Portal</div>
            </div>
          </div>

          {/* Card */}
          <div className="w-full overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-level-2">

            {/* Top accent stripe using primary + secondary */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-container to-secondary" />

            <div className="p-4 sm:p-8">

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-on-surface">Complete your profile</h1>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  Fill in your details to get started with your learning journey.
                </p>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/30 bg-error-container/20 p-3.5 text-error">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px]">error</span>
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Row 1 — Name & Phone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" icon="person" error={errors.name?.message} required>
                    <Input
                      type="text"
                      disabled={isPending}
                      placeholder="e.g. Abdullah Al Mamun"
                      {...register("name")}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Phone Number" icon="call" error={errors.phone?.message} required>
                    <Input
                      type="tel"
                      disabled={isPending}
                      placeholder="e.g. 017XXXXXXXX"
                      {...register("phone")}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Row 2 — Class (full width) */}
                <Field label="Academic Class" icon="school" error={errors.academicClassId?.message} required>
                  <Controller
                    name="academicClassId"
                    control={control}
                    render={({ field }) => (
                      <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={selectTriggerCls}>
                          <SelectValue placeholder="Select your class" />
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg">
                          {academicClassesQuery.isLoading ? (
                            <SelectItem value="" disabled>Loading…</SelectItem>
                          ) : (
                            academicClassesQuery.data?.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                {/* Row 3 — Institute & Roll */}
                <div className={shouldShowRoll ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "block"}>
                  <Field label="Institute / School" icon="account_balance" error={errors.institute?.message} required>
                    <Input
                      type="text"
                      disabled={isPending}
                      placeholder="e.g. Dhaka College"
                      {...register("institute")}
                      className={inputCls}
                    />
                  </Field>

                  {shouldShowRoll && (
                    <Field label="Roll Number" icon="badge" error={errors.roll?.message}>
                      <Input
                        type="number"
                        disabled={isPending}
                        placeholder="Optional"
                        {...register("roll")}
                        className={inputCls}
                      />
                    </Field>
                  )}
                </div>

                {/* Offline student checkbox card */}
                <Controller
                  name="isOfflineStudent"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="isOfflineStudent"
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3.5 transition-colors hover:border-primary/40 hover:bg-primary-fixed/20"
                    >
                      <Checkbox
                        id="isOfflineStudent"
                        disabled={isPending}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          I attend classes physically at BEC
                        </p>
                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Check this if you are an offline student at Basic Education Care.
                        </p>
                      </div>
                    </label>
                  )}
                />

                {/* Submit button */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-outline-variant bg-surface-container-lowest p-3 z-20 sm:p-4 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:border-t-0 lg:bg-transparent lg:p-0 lg:z-auto">
                  <div className="mx-auto max-w-lg lg:max-w-none">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary shadow-md shadow-primary/25 transition-all hover:bg-primary-container hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[18px]">
                            progress_activity
                          </span>
                          <span>Saving…</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Onboarding</span>
                          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </form>
            </div>
          </div>


        </div>
      </main>
    </div>
  )
}
