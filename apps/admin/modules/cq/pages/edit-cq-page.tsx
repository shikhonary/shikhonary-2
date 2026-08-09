"use client"

import { useCqById } from "../services/use-cq"
import { EditCqView } from "../components/edit-cq-view"
import { Loader2 } from "lucide-react"

interface EditCqPageProps {
  id: string
}

export function EditCqPage({ id }: EditCqPageProps) {
  const { data: cq, isLoading, isError } = useCqById(id)

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !cq) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-error">
        <h3 className="font-bold">Error</h3>
        <p className="text-sm">Failed to load Creative Question or question does not exist.</p>
      </div>
    )
  }

  return <EditCqView cq={cq} />
}
