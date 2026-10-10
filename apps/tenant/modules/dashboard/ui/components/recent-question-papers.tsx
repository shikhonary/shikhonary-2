import React from "react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { FileText, ArrowRight, Clock, BookOpen, Sparkles, ChevronRight } from "lucide-react"
import { toBengaliDigits } from "@/modules/subscription-plan/utils"

interface RecentPaper {
  id: string
  title: string
  examName: string
  className: string
  status: string
  total: number
  timeInMinutes: number
  questionCount: number
  subjectCount: number
  subjects: {
    id: string
    subjectName: string
    subjectTotal: number
  }[]
  createdAt: Date | string
  updatedAt: Date | string
}

interface RecentQuestionPapersProps {
  papers: RecentPaper[]
}

export const RecentQuestionPapers: React.FC<RecentQuestionPapersProps> = ({ papers }) => {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground font-headline">
              সাম্প্রতিক প্রশ্নপত্র
            </h3>
            <p className="text-[11px] text-muted-foreground font-body">
              সর্বশেষ সম্পাদিত ও তৈরি প্রশ্নপত্রসমূহ
            </p>
          </div>
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 rounded-xl cursor-pointer font-headline"
        >
          <Link href="/question-papers" className="flex items-center gap-1">
            <span>সকল প্রশ্নপত্র</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Content */}
      {papers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground font-headline">কোনো প্রশ্নপত্র পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground font-body max-w-xs">
              আপনার প্রতিষ্ঠানে এখনো কোনো প্রশ্নপত্র তৈরি করা হয়নি। নতুন প্রশ্নপত্র তৈরি করুন।
            </p>
          </div>
          <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-headline mt-2 cursor-pointer">
            <Link href="/question-papers/create">
              প্রশ্নপত্র তৈরি করুন
            </Link>
          </Button>
        </div>
      ) : (
        <div>
          {/* Mobile Cards (sm:hidden) */}
          <div className="space-y-2.5 sm:hidden">
            {papers.map((paper) => {
              const isPublished = paper.status === "Published"
              return (
                <div
                  key={paper.id}
                  className="p-3 rounded-2xl border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/40 dark:bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/question-papers/${paper.id}`}
                      className="text-xs font-bold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-headline line-clamp-1 block flex-1"
                    >
                      {paper.title || paper.examName}
                    </Link>
                    <Badge
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-headline shrink-0 ${
                        isPublished
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                      }`}
                    >
                      {isPublished ? "পাবলিশড" : "ড্রাফট"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap font-body">
                    <span className="font-semibold text-foreground font-solaiman bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-900/40">
                      {paper.className}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-indigo-500" />
                      <strong className="text-foreground font-solaiman">{toBengaliDigits(paper.subjectCount)}</strong> বিষয়
                    </span>
                    <span>·</span>
                    <span>
                      প্রশ্ন: <strong className="text-foreground font-solaiman">{toBengaliDigits(paper.questionCount)}</strong>টি
                    </span>
                    <span>·</span>
                    <span>
                      পূর্ণমান: <strong className="text-indigo-600 dark:text-indigo-400 font-solaiman">{toBengaliDigits(paper.total)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                    <span className="text-[10px] text-muted-foreground font-solaiman">
                      {new Date(paper.updatedAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-xl px-3 text-[11px] font-bold text-foreground border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer font-headline"
                    >
                      <Link href={`/question-papers/${paper.id}`} className="flex items-center gap-1">
                        <span>বিস্তারিত</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Clean Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/30 dark:bg-white/[0.01]">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/[0.04] text-muted-foreground text-[11px] font-headline uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">পরীক্ষার নাম</th>
                  <th className="py-3 px-3 font-bold">শ্রেণী</th>
                  <th className="py-3 px-3 font-bold text-center">কাঠামো</th>
                  <th className="py-3 px-3 font-bold text-center">পূর্ণমান</th>
                  <th className="py-3 px-3 font-bold text-center">অবস্থা</th>
                  <th className="py-3 px-4 text-right font-bold">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {papers.map((paper) => {
                  const isPublished = paper.status === "Published"
                  return (
                    <tr
                      key={paper.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-headline">
                        <Link
                          href={`/question-papers/${paper.id}`}
                          className="font-bold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-xs sm:text-sm line-clamp-1"
                        >
                          {paper.title || paper.examName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-solaiman block mt-0.5">
                          আপডেট: {new Date(paper.updatedAt).toLocaleDateString("bn-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-foreground font-solaiman bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-xs">
                          {paper.className}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-2 text-muted-foreground text-xs font-solaiman">
                          <span>{toBengaliDigits(paper.subjectCount)} বিষয়</span>
                          <span>·</span>
                          <span>{toBengaliDigits(paper.questionCount)} প্রশ্ন</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-black text-indigo-600 dark:text-indigo-400 font-solaiman text-sm">
                          {toBengaliDigits(paper.total)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg font-headline ${
                            isPublished
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                          }`}
                        >
                          {isPublished ? "পাবলিশড" : "ড্রাফট"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-headline cursor-pointer"
                        >
                          <Link href={`/question-papers/${paper.id}`} className="flex items-center gap-1">
                            <span>ভিউ ও এডিট</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
