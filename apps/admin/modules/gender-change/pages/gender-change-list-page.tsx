import { Suspense } from "react"
import { GenderChangeListView } from "../components/gender-change-list-view"

export function GenderChangeListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <GenderChangeListView />
    </Suspense>
  )
}
