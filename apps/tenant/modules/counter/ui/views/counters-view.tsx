"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Button } from "@workspace/ui/components/button"
import { Hash, Plus, RotateCcw } from "lucide-react"

import { useCounterModalStore } from "../store/use-counter-modal-store"
import { useCounterSearchParams } from "../hooks/use-counter-search-params"
import { CounterFilter } from "../components/counter-filter"
import { CounterList } from "../components/counter-list"
import { CounterModal } from "../components/counter-modal"
import { DeleteCounterModal } from "../components/delete-counter-modal"

export function CountersView() {
  const { openModal: openCreateModal } = useCounterModalStore()
  const [searchParams, setSearchParams] = useCounterSearchParams()
  const searchQuery = searchParams.search
  const sortFilter = searchParams.sort as "all" | "key_asc" | "key_desc" | "value_desc" | "value_asc" | "newest" | "oldest"

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: counters = [], isLoading, isError, refetch } = useQuery(
    trpc.tenantCounter.list.queryOptions()
  )

  const processedItems = [...counters]
    .filter((c: any) =>
      c.key.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .sort((a: any, b: any) => {
      if (sortFilter === "key_asc") return a.key.localeCompare(b.key)
      if (sortFilter === "key_desc") return b.key.localeCompare(a.key)
      if (sortFilter === "value_desc") return b.value - a.value
      if (sortFilter === "value_asc") return a.value - b.value
      if (sortFilter === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortFilter === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return 0
    })

  const totalItems = processedItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const displayStart = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const displayEnd = Math.min(currentPage * itemsPerPage, totalItems)
  const pagedItems = processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            কাউন্টার ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl font-body text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়নের বিভিন্ন মডিউলের রেকর্ড ট্র্যাকিং কাউন্টার এবং তাদের বর্তমান মানসমূহ পরিচালনা করুন।
          </p>
        </div>
        <Button
          onClick={() => openCreateModal("create")}
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
          <span className="relative z-10">নতুন কাউন্টার যোগ করুন</span>
        </Button>
      </section>

      {/* Filter Bar */}
      <CounterFilter setCurrentPage={setCurrentPage} />

      {/* Content Table & Mobile Card List View */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-card shadow-xs">
        {!isLoading && !isError && processedItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Hash className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-foreground">কোনো কাউন্টার পাওয়া যায়নি</p>
            <p className="text-xs text-muted-foreground max-w-sm font-body">
              {searchQuery
                ? "অনুসন্ধান অনুযায়ী কোনো রেকর্ড পাওয়া যায়নি। অনুসন্ধান রিসেট করুন।"
                : "নতুন কাউন্টার যোগ করার মাধ্যমে আপনার মডিউল ট্র্যাকিং শুরু করুন।"}
            </p>
            {searchQuery ? (
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
                onClick={() => openCreateModal("create")}
                className="mt-2 rounded-lg bg-primary text-primary-foreground font-bold"
              >
                <Plus className="h-4 w-4 mr-1" /> প্রথম কাউন্টার যোগ করুন
              </Button>
            )}
          </div>
        ) : (
          <CounterList
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

      {/* Form Modal */}
      <CounterModal />
      <DeleteCounterModal />
    </div>
  )
}
