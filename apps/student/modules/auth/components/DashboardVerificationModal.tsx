"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { authClient } from "@workspace/auth/client"
import { useCurrentUser, useUpdateUserContact } from "@/modules/user/services/use-user"
import PhoneOtpVerificationCard from "./PhoneOtpVerificationCard"
import VerificationStatusCard from "./VerificationStatusCard"
import { AlertCircle, CheckCircle2, Edit2, Phone, Mail } from "lucide-react"

interface DashboardVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardVerificationModal({
  open,
  onOpenChange,
}: DashboardVerificationModalProps) {
  const { user, isPhoneUnverified, isEmailUnverified, refetch } = useCurrentUser()
  const updateUserContactMutation = useUpdateUserContact()

  // State
  const [otpCode, setOtpCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // Edit contact state
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [newContactValue, setNewContactValue] = useState("")
  const [contactUpdateError, setContactUpdateError] = useState<string | null>(null)

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle SMS OTP Verification
  const handleVerifyOtp = async (codeOverride?: string | React.FormEvent) => {
    const codeToUse = typeof codeOverride === "string" ? codeOverride : otpCode
    if (!codeToUse || codeToUse.length !== 6) {
      setError("অনুগ্রহ করে ৬ ডিজিটের ওটিপি (OTP) কোডটি সঠিকভাবে দিন।")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber: user?.phoneNumber || "",
        code: codeToUse,
      })

      if (verifyError) {
        setError(verifyError.message ?? "ভুল অথবা মেয়াদকোীর্ণ ওটিপি কোড। পুনরায় চেষ্টা করুন।")
        return
      }

      // Verification successful
      await refetch()
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message ?? "একটি সমস্যা হয়েছে। ওটিপি পুনরায় চেষ্টা করুন।")
    } finally {
      setLoading(false)
    }
  }

  // Handle Resend SMS OTP
  const handleResendOtp = async () => {
    if (!user?.phoneNumber) return
    setResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const { error: sendError } = await authClient.phoneNumber.sendOtp({
        phoneNumber: user.phoneNumber,
      })

      if (sendError) {
        setError(sendError.message ?? "ওটিপি পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।")
        return
      }

      setResendSuccess(true)
      setCountdown(60)
    } catch (err: any) {
      setError(err?.message ?? "ওটিপি পাঠাতে একটি সমস্যা হয়েছে।")
    } finally {
      setResending(false)
    }
  }

  // Handle Resend Email Verification Link
  const handleResendEmail = async () => {
    if (!user?.email) return
    setResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const { error: sendError } = await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: `${window.location.origin}/auth/sign-in?verified=true`,
      })

      if (sendError) {
        setError(sendError.message ?? "ইমেইল পাঠাতে ব্যর্থ হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।")
        return
      }

      setResendSuccess(true)
      setCountdown(60)
    } catch (err: any) {
      setError(err?.message ?? "ইমেইল পাঠাতে সমস্যা হয়েছে।")
    } finally {
      setResending(false)
    }
  }

  // Handle updating contact info (editing phone/email typo)
  const handleSaveContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactUpdateError(null)

    if (!newContactValue.trim()) {
      setContactUpdateError("সঠিক তথ্য প্রবেশ করান।")
      return
    }

    try {
      if (isPhoneUnverified) {
        const cleanPhone = newContactValue.replace(/\D/g, "")
        if (cleanPhone.length < 11) {
          setContactUpdateError("সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।")
          return
        }
        await updateUserContactMutation.mutateAsync({ phoneNumber: cleanPhone })
        // Send OTP to new number
        await authClient.phoneNumber.sendOtp({ phoneNumber: cleanPhone })
      } else {
        await updateUserContactMutation.mutateAsync({ email: newContactValue.trim() })
        await authClient.sendVerificationEmail({
          email: newContactValue.trim(),
          callbackURL: `${window.location.origin}/auth/sign-in?verified=true`,
        })
      }

      await refetch()
      setIsEditingContact(false)
      setResendSuccess(true)
      setCountdown(60)
    } catch (err: any) {
      setContactUpdateError(err?.message ?? "তথ্য পরিবর্তন করতে ব্যর্থ হয়েছে।")
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6 bg-surface text-on-surface border-outline-variant">
        <DialogHeader className="sr-only">
          <DialogTitle>অ্যাকাউন্ট ভেরিফিকেশন</DialogTitle>
          <DialogDescription>আপনার অ্যাকাউন্ট ভেরিফাই করুন</DialogDescription>
        </DialogHeader>

        {isEditingContact ? (
          /* EDIT CONTACT FORM MODE */
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b pb-3 border-outline-variant">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {isPhoneUnverified ? <Phone className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isPhoneUnverified ? "মোবাইল নম্বর পরিবর্তন" : "ইমেইল ঠিকানা পরিবর্তন"}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  ভুল তথ্য দেওয়া থাকলে এখান থেকে সংশোধন করুন
                </p>
              </div>
            </div>

            {contactUpdateError && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{contactUpdateError}</span>
              </div>
            )}

            <form onSubmit={handleSaveContactUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {isPhoneUnverified ? "নতুন মোবাইল নম্বর" : "নতুন ইমেইল ঠিকানা"}
                </label>
                <Input
                  type={isPhoneUnverified ? "tel" : "email"}
                  placeholder={isPhoneUnverified ? "017XXXXXXXX" : "name@example.com"}
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingContact(false)}
                  disabled={updateUserContactMutation.isPending}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                  disabled={updateUserContactMutation.isPending}
                >
                  {updateUserContactMutation.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ ও ওটিপি পাঠান"}
                </Button>
              </div>
            </form>
          </div>
        ) : isPhoneUnverified ? (
          /* PHONE OTP VERIFICATION MODE */
          <div>
            <PhoneOtpVerificationCard
              phoneNumber={user.phoneNumber || ""}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              loading={loading}
              resending={resending}
              resendSuccess={resendSuccess}
              error={error}
              countdown={countdown}
              formatTime={formatTime}
              title="ফোন নম্বর ভেরিফাই করুন"
              description={`আমরা আপনার ফোন নম্বরে (${user.phoneNumber}) একটি ৬ ডিজিটের ওটিপি পাঠিয়েছি।`}
              backText="নম্বর সংশোধন করতে ক্লিক করুন"
              verifyText="ভেরিফাই করুন"
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBack={() => {
                setNewContactValue(user.phoneNumber || "")
                setIsEditingContact(true)
              }}
            />
          </div>
        ) : isEmailUnverified ? (
          /* EMAIL VERIFICATION MODE */
          <div>
            <VerificationStatusCard
              registeredEmail={user.email}
              resendSuccess={resendSuccess}
              resending={resending}
              error={error}
              countdown={countdown}
              formatTime={formatTime}
              onResend={handleResendEmail}
            />

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setNewContactValue(user.email || "")
                  setIsEditingContact(true)
                }}
                className="text-xs text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>ইমেইল সংশোধন করতে চান?</span>
              </button>
            </div>
          </div>
        ) : (
          /* ALREADY VERIFIED STATE */
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold">অ্যাকাউন্ট ভেরিফাইড!</h3>
            <p className="text-sm text-on-surface-variant">
              আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে।
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              ঠিক আছে
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
