"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { MapPin, Plus, RotateCcw } from "lucide-react"

import { useWardSearchParams } from "../hooks/use-ward-search-params"
import { useWardModalStore } from "../store/use-ward-modal-store"
import { WardFilter } from "../components/ward-filter"
import { WardList } from "../components/ward-list"
import { WardModal } from "../components/ward-modal"
import { DeleteWardModal } from "../components/delete-ward-modal"

export function WardsView() {
  const { openModal: openCreateModal } = useWardModalStore()
  const searchParamsHook = useSearchParams()
  const hasNewParam = searchParamsHook.get("new") === "true"

  useEffect(() => {
    if (hasNewParam) {
      openCreateModal()
    }
  }, [hasNewParam, openCreateModal])

  // URL Search Params State (nuqs)
  const [searchParams, setSearchParams] = useWardSearchParams()
  const searchQuery = searchParams.search || ""
  const sortFilter = (searchParams.sort as "all" | "name_asc" | "name_desc" | "newest" | "oldest") || "all"

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: wardData, isLoading, isError, refetch } = useQuery(
    trpc.tenantWard.list.queryOptions({
      limit: itemsPerPage * 5,
      search: searchQuery.trim() || undefined,
      sort: sortFilter === "all" ? undefined : sortFilter,
    })
  )

  const allItems = wardData?.wards ?? []
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedItems = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-6 font-body">
      {/* Header — Section Title & Primary CTA */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            ওয়ার্ড ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের ওয়ার্ডসমূহ, ওয়ার্ড নম্বর ও শিরোনাম পরিচালনা করুন।
          </p>
        </div>
        <Button
          onClick={() => openCreateModal()}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">নতুন ওয়ার্ড যোগ করুন</span>
        </Button>
      </section>

      {/* Filter Bar */}
      <WardFilter setCurrentPage={setCurrentPage} />

      {/* Content Table & Mobile Card List View */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card shadow-xs">
        {!isLoading && !isError && allItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">কোনো ওয়ার্ড পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchQuery || sortFilter !== "all"
                ? "ফিল্টার অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি। অনুসন্ধান বা ফিল্টার রিসেট করুন।"
                : "ইউনিয়ন পরিষদের ওয়ার্ড পরিচালনার জন্য প্রথম ওয়ার্ড (যেমন: ওয়ার্ড নং ১) যোগ করুন।"}
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
                <Plus className="h-4 w-4 mr-1" /> প্রথম ওয়ার্ড যোগ করুন
              </Button>
            )}
          </div>
        ) : (
          <WardList
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
      <WardModal />
      <DeleteWardModal />
    </div>
  )
}
