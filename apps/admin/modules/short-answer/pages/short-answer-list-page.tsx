"use client"

import { Suspense } from "react"
import { ShortAnswerListView } from "../components/short-answer-list-view"

export function ShortAnswerListPage() {
  return (
    <Suspense>
      <ShortAnswerListView />
    </Suspense>
  )
}
