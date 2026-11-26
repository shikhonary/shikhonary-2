import { Suspense } from "react"
import { PoemListView } from "../components/poem-list-view"

export function PoemListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <PoemListView />
    </Suspense>
  )
}
