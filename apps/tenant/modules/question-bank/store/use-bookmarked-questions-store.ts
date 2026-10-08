import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "@workspace/ui/components/sonner"

export interface BookmarkedQuestionItem {
  id: string
  category?: string
  subjectId?: string
  chapterId?: string
  questionText?: string
  savedAt: number
}

interface BookmarkedQuestionsState {
  bookmarks: Record<string, BookmarkedQuestionItem>
  isBookmarked: (id: string) => boolean
  toggleBookmark: (question: {
    id: string
    category?: string
    subjectId?: string
    chapterId?: string
    questionText?: string
  }) => boolean
  getBookmarkedIds: (options?: { subjectId?: string; category?: string }) => string[]
  clearAllBookmarks: () => void
}

export const useBookmarkedQuestionsStore = create<BookmarkedQuestionsState>()(
  persist(
    (set, get) => ({
      bookmarks: {},

      isBookmarked: (id: string) => {
        return Boolean(get().bookmarks[id])
      },

      toggleBookmark: (question) => {
        const current = get().bookmarks
        const exists = Boolean(current[question.id])

        if (exists) {
          const updated = { ...current }
          delete updated[question.id]
          set({ bookmarks: updated })
          toast.info("প্রশ্নটি বুকমার্ক থেকে সরানো হয়েছে")
          return false
        } else {
          const updated = {
            ...current,
            [question.id]: {
              id: question.id,
              category: question.category,
              subjectId: question.subjectId,
              chapterId: question.chapterId,
              questionText: question.questionText,
              savedAt: Date.now(),
            },
          }
          set({ bookmarks: updated })
          toast.success("প্রশ্নটি বুকমার্কে সংরক্ষণ করা হয়েছে")
          return true
        }
      },

      getBookmarkedIds: (options) => {
        const all = Object.values(get().bookmarks)
        let filtered = all

        if (options?.subjectId) {
          filtered = filtered.filter((b) => b.subjectId === options.subjectId)
        }
        if (options?.category && options.category !== "ALL") {
          filtered = filtered.filter(
            (b) => b.category?.toUpperCase() === options.category?.toUpperCase()
          )
        }

        return filtered.map((b) => b.id)
      },

      clearAllBookmarks: () => {
        set({ bookmarks: {} })
        toast.info("সকল বুকমার্ক মুছে ফেলা হয়েছে")
      },
    }),
    {
      name: "shikhonary_bookmarked_questions",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
