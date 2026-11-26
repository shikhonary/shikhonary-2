import { Suspense } from "react"
import { EditPoemView } from "../components/edit-poem-view"

export function EditPoemPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <EditPoemView />
    </Suspense>
  )
}
