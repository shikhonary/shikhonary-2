import { Suspense } from "react"
import { FormFillingListView } from "../components/form-filling-list-view"

export function FormFillingListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <FormFillingListView />
    </Suspense>
  )
}
