import type { Metadata } from "next"
import { ImportChangingSentencePage } from "@/modules/changing-sentence/pages/import-changing-sentence-page"

export const metadata: Metadata = {
  title: "Import Changing Sentences | Admin Dashboard",
  description: "Bulk import Changing Sentences using JSON",
}

export default function Page() {
  return <ImportChangingSentencePage />
}
