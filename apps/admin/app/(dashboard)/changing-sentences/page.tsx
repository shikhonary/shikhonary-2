import type { Metadata } from "next"
import { ChangingSentenceListPage } from "@/modules/changing-sentence/pages/changing-sentence-list-page"

export const metadata: Metadata = {
  title: "Changing Sentences | Admin Dashboard",
  description: "Manage Changing Sentences (Transformation of Sentences) questions and options",
}

export default function Page() {
  return <ChangingSentenceListPage />
}
