import { Suspense } from "react"
import { EditPodNirnoyView } from "../components/edit-pod-nirnoy-view"

interface EditPodNirnoyPageProps {
  id: string
}

export function EditPodNirnoyPage({ id }: EditPodNirnoyPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditPodNirnoyView id={id} />
    </Suspense>
  )
}
