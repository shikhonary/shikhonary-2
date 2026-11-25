import { Suspense } from "react"
import { PodNirnoyListView } from "../components/pod-nirnoy-list-view"

export function PodNirnoyListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <PodNirnoyListView />
    </Suspense>
  )
}
