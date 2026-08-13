"use client"

import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useRouter } from "next/navigation"
import { EditCitizenForm } from "../components/edit-citizen-form"

interface EditCitizenViewProps {
  id: string
}

export function EditCitizenView({ id }: EditCitizenViewProps) {
  const router = useRouter()

  const { data: citizen, isLoading, isError, refetch } = useQuery(
    trpc.citizen.byId.queryOptions({ id })
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 max-w-4xl mx-auto bg-card border rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-semibold">নাগরিক তথ্য লোড হচ্ছে...</span>
      </div>
    )
  }

  if (isError || !citizen) {
    return (
      <div className="text-center py-20 text-rose-500 flex flex-col items-center gap-3 max-w-4xl mx-auto bg-card border rounded-2xl">
        <AlertCircle className="w-10 h-10 text-rose-500/80" />
        <span className="text-sm font-semibold">নাগরিকের তথ্য লোড করতে সমস্যা হয়েছে বা তথ্যটি খুঁজে পাওয়া যায়নি।</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/citizens")}>তালিকায় ফিরে যান</Button>
          <Button size="sm" onClick={() => refetch()}>পুনরায় চেষ্টা করুন</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background w-full">
      <main className="w-full py-4">
        <EditCitizenForm citizen={citizen} />
      </main>
    </div>
  )
}
