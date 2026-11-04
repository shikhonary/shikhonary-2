"use client"

import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useSendTenantInvitation } from "../../services/use-tenant"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Mail, Loader2, Send } from "lucide-react"

export function InviteAdminModal() {
  const { isOpen, tenantId, tenantName, closeModal } = useInvitationModalStore()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("ADMIN")
  const [message, setMessage] = useState("")

  const isEmailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const inviteMutation = useSendTenantInvitation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !email.trim() || !isEmailValid) {
      toast.error("অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।")
      return
    }

    try {
      await inviteMutation.mutateAsync({
        tenantId,
        email: email.trim(),
        name: name.trim() || undefined,
        role,
        message: message.trim() || undefined,
      })
      toast.success(`${email}-এর জন্য আমন্ত্রণ লিঙ্ক সফলভাবে তৈরি ও পাঠানো হয়েছে।`)
      setEmail("")
      setName("")
      setMessage("")
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "আমন্ত্রণ পাঠাতে ব্যর্থ হয়েছে")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              অ্যাডমিন বা সদস্য আমন্ত্রণ
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {tenantName ? `"${tenantName}"-এর জন্য আমন্ত্রণ লিঙ্ক` : "প্রতিষ্ঠানের জন্য আমন্ত্রণ লিঙ্ক"}
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1">
          <DialogDescription className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            প্রতিষ্ঠানের নতুন অ্যাডমিনিস্ট্রেটর বা কর্মকর্তার তথ্য প্রদান করুন। তাকে সিস্টেমে যুক্ত হওয়ার আমন্ত্রণ পাঠানো হবে।
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ইমেইল এড্রেস <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="admin@school.shikhonary.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteMutation.isPending}
              required
              className={`w-full rounded-xl border py-2 px-3.5 text-sm transition-all bg-white dark:bg-slate-950 h-10 ${
                !isEmailValid
                  ? "border-rose-400 focus-visible:ring-rose-400"
                  : "border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
              }`}
            />
            {!isEmailValid && (
              <p className="text-xs text-rose-500 font-medium">সঠিক ইমেইল ফরম্যাট লিখুন (যেমন: info@example.com)</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                পূর্ণ নাম
              </Label>
              <Input
                placeholder="যেমন: মো: রফিকুল ইসলাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={inviteMutation.isPending}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ভূমিকা / রোল
              </Label>
              <Select value={role} onValueChange={setRole} disabled={inviteMutation.isPending}>
                <SelectTrigger className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-3.5 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md rounded-xl">
                  <SelectItem value="ADMIN">অ্যাডমিন (ADMIN)</SelectItem>
                  <SelectItem value="SECRETARY">সেক্রেটারি (SECRETARY)</SelectItem>
                  <SelectItem value="TEACHER">শিক্ষক (TEACHER)</SelectItem>
                  <SelectItem value="STAFF">স্টাফ (STAFF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ব্যক্তিগত বার্তা (ঐচ্ছিক)
            </Label>
            <Textarea
              placeholder="আমন্ত্রণ বার্তা বা শুভেচ্ছা..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={inviteMutation.isPending}
              rows={2}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 px-3 text-sm bg-white dark:bg-slate-950 focus-visible:ring-indigo-500 min-h-[64px]"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              disabled={inviteMutation.isPending}
              onClick={closeModal}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 h-9"
            >
              বাতিল
            </Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim() || !isEmailValid}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold h-9 shadow-xs disabled:opacity-50"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>আমন্ত্রণ পাঠান</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
