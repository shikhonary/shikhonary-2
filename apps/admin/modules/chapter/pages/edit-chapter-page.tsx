"use client"

import { EditChapterView } from "../components/edit-chapter-view"

interface EditChapterPageProps {
  chapterId: string
}

export function EditChapterPage({ chapterId }: EditChapterPageProps) {
  return <EditChapterView chapterId={chapterId} />
}
