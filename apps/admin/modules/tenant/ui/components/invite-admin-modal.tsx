"use client"

import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
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
  const queryClient = useQueryClient()
  const { isOpen, tenantId, tenantName, closeModal } = useInvitationModalStore()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("STAFF")
  const [message, setMessage] = useState("")

  const isEmailValid = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const inviteMutation = useMutation({
    ...trpc.tenant.sendInvitation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success(`Invitation link generated and recorded for ${email}.`)
      setEmail("")
      setName("")
      setMessage("")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send invitation")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !email.trim() || !isEmailValid) {
      toast.error("Please enter a valid email address.")
      return
    }

    inviteMutation.mutate({
      tenantId,
      email: email.trim(),
      name: name.trim() || undefined,
      role,
      message: message.trim() || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              Invite Team Member
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              Send access invitation link for {tenantName || "Union Porishod"}
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            Enter the details of the prospective portal administrator or official to grant access credentials.
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields — 1:1 Matched with Create Tenant View Form Styling */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Email Address *
            </Label>
            <Input
              type="email"
              placeholder="secretary@savar.uphub.gov.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteMutation.isPending}
              required
              className={`w-full rounded-lg border py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 ${
                !isEmailValid ? "border-error focus:border-error focus-visible:ring-error/20" : "border-outline-variant"
              }`}
            />
            {!isEmailValid && (
              <p className="text-xs text-error font-medium">Please enter a valid email address (e.g. info@savar.uphub.gov.bd)</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Full Name
              </Label>
              <Input
                placeholder="Md. Rahim Uddin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={inviteMutation.isPending}
                className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Role Assignment
              </Label>
              <Select value={role} onValueChange={setRole} disabled={inviteMutation.isPending}>
                <SelectTrigger className="w-full rounded-lg border border-outline-variant py-2.5 px-4 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden h-10 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-outline-variant shadow-md rounded-lg">
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="SECRETARY">SECRETARY</SelectItem>
                  <SelectItem value="STAFF">STAFF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="block font-label-sm text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Personal Message (Optional)
            </Label>
            <Textarea
              placeholder="Welcome to Savar Union Porishod digital portal administration..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={inviteMutation.isPending}
              rows={2}
              className="w-full rounded-lg border border-outline-variant py-2 px-3 font-body-md text-sm text-on-surface transition-all bg-white focus:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden min-h-[60px]"
            />
          </div>

          {/* Footer Buttons — 1:1 Matched with Create Tenant View Footer Styling */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-outline-variant/30">
            <Button
              type="button"
              variant="outline"
              disabled={inviteMutation.isPending}
              onClick={closeModal}
              className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim() || !isEmailValid}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary/90 cursor-pointer h-10 normal-case tracking-normal shadow-sm disabled:opacity-50"
            >
              {inviteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
