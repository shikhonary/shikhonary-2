import { Suspense } from "react"
import { RearrangeListView } from "../components/rearrange-list-view"

export function RearrangeListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <RearrangeListView />
    </Suspense>
  )
}
