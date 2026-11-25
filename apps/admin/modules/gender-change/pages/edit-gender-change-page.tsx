import { Suspense } from "react"
import { EditGenderChangeView } from "../components/edit-gender-change-view"

interface EditGenderChangePageProps {
  id: string
}

export function EditGenderChangePage({ id }: EditGenderChangePageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditGenderChangeView id={id} />
    </Suspense>
  )
}
