import { Suspense } from "react"
import { EditRearrangeView } from "../components/edit-rearrange-view"

interface EditRearrangePageProps {
  id: string
}

export function EditRearrangePage({ id }: EditRearrangePageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditRearrangeView id={id} />
    </Suspense>
  )
}
