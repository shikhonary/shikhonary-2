import { Suspense } from "react"
import { EditFormFillingView } from "../components/edit-form-filling-view"

interface EditFormFillingPageProps {
  id: string
}

export function EditFormFillingPage({ id }: EditFormFillingPageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditFormFillingView id={id} />
    </Suspense>
  )
}
