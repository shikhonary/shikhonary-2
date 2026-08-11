"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { Calendar, Plus, RotateCcw } from "lucide-react"

import { useFiscalYearSearchParams } from "../hooks/use-fiscal-year-search-params"
import { useFiscalYearModalStore } from "../store/use-fiscal-year-modal-store"
import { FiscalYearFilter } from "../components/fiscal-year-filter"
import { FiscalYearList } from "../components/fiscal-year-list"
import { FiscalYearModal } from "../components/fiscal-year-modal"
import { DeleteFiscalYearModal } from "../components/delete-fiscal-year-modal"

export function FiscalYearsView() {
  const { openModal: openCreateModal } = useFiscalYearModalStore()

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useFiscalYearSearchParams()
  const searchQuery = searchParams.search
  const sortFilter = searchParams.sort as "all" | "name_asc" | "name_desc" | "newest" | "oldest"

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: fiscalYearData, isLoading, isError, refetch } = useQuery(
    trpc.tenantFiscalYear.list.queryOptions({
      limit: itemsPerPage * 5,
      search: searchQuery.trim() || undefined,
      sort: sortFilter === "all" ? undefined : sortFilter,
    })
  )

  const allItems = fiscalYearData?.fiscalYears ?? []
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-6">
      {/* Header — Purely Bangla Title & Action */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            অর্থবছর ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl font-body text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের বাৎসরিক অর্থবছর, শুরু ও শেষের তারিখ এবং বর্তমান সক্রিয় অর্থবছর পরিচালনা করুন।
          </p>
        </div>
        <Button
          onClick={() => openCreateModal()}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">নতুন অর্থবছর যোগ করুন</span>
        </Button>
      </section>

      {/* Filter Bar */}
      <FiscalYearFilter setCurrentPage={setCurrentPage} />

      {/* Content Table & Mobile Card List View */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card shadow-xs">
        {!isLoading && !isError && allItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">কোনো অর্থবছর পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchQuery || sortFilter !== "all"
                ? "ফিল্টার অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি। অনুসন্ধান বা ফিল্টার রিসেট করুন।"
                : "বাজেট ও হিসাবরক্ষণ চক্র পরিচালনার জন্য প্রথম অর্থবছর (যেমন ২০২৫-২০২৬) যোগ করুন।"}
            </p>
            {searchQuery || sortFilter !== "all" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchParams({ search: "", sort: "all" })
                  setCurrentPage(1)
                }}
                className="mt-2 rounded-lg border-border text-foreground hover:bg-muted font-bold"
              >
                <RotateCcw className="h-4 w-4 mr-1" /> ফিল্টার রিসেট করুন
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => openCreateModal()}
                className="mt-2 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                <Plus className="h-4 w-4 mr-1" /> প্রথম অর্থবছর যোগ করুন
              </Button>
            )}
          </div>
        ) : (
          <FiscalYearList
            pagedItems={pagedItems}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
            totalItems={totalItems}
            displayStart={displayStart}
            displayEnd={displayEnd}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Form Modals */}
      <FiscalYearModal />
      <DeleteFiscalYearModal />
    </div>
  )
}
