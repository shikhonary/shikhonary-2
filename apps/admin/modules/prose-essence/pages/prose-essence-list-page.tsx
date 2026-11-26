import { Suspense } from "react"
import { ProseEssenceListView } from "../components/prose-essence-list-view"

export function ProseEssenceListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>}>
      <ProseEssenceListView />
    </Suspense>
  )
}
