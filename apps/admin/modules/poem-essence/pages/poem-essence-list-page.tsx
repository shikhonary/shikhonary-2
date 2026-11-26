import { Suspense } from "react"
import { PoemEssenceListView } from "../components/poem-essence-list-view"

export function PoemEssenceListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <PoemEssenceListView />
    </Suspense>
  )
}
