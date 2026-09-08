import type { Metadata } from "next"
import { CreateChangingSentencePage } from "@/modules/changing-sentence/pages/create-changing-sentence-page"

export const metadata: Metadata = {
  title: "Create Changing Sentence | Admin Dashboard",
  description: "Add a new Changing Sentence question",
}

export default function Page() {
  return <CreateChangingSentencePage />
}
