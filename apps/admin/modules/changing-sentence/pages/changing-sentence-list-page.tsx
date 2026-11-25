"use client"

import { Suspense } from "react"
import { ChangingSentenceListView } from "../components/changing-sentence-list-view"

export function ChangingSentenceListPage() {
  return (
    <Suspense>
      <ChangingSentenceListView />
    </Suspense>
  )
}
