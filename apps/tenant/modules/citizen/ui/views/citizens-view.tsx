"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

import { useCitizenSearchParams } from "../hooks/use-citizen-search-params"
import { CitizenKpi } from "../components/citizen-kpi"
import { CitizenFilter } from "../components/citizen-filter"
import { CitizenList } from "../components/citizen-list"
import { CitizenDetailSheet } from "../modal/citizen-detail-sheet"
import { useCitizenDetailStore } from "../store/use-citizen-detail-store"

export function CitizensView() {
  const detailStore = useCitizenDetailStore()

  // Search parameters managed in URL via nuqs
  const [searchParams, setSearchParams] = useCitizenSearchParams()
  const searchQuery = searchParams.search
  const wardFilter = searchParams.wardId
  const residentTypeFilter = searchParams.residentType
  const sortFilter = searchParams.sort

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch Wards for filtering
  const { data: WardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = WardsData?.wards || []

  // Fetch Citizens List
  const { data: citizensData, isLoading, isError, refetch } = useQuery(
    trpc.citizen.list.queryOptions({
      limit: 100,
      search: searchQuery.trim() || undefined,
      wardId: wardFilter === "all" ? undefined : wardFilter,
      residentType: residentTypeFilter === "all" ? undefined : residentTypeFilter,
      sort: sortFilter === "all" ? undefined : (sortFilter as any),
    })
  )
  const citizens = citizensData?.citizens || []

  // Derived counts for quick stats
  const totalCount = citizens.length
  const permanentCount = citizens.filter((c) => c.residentType === "PERMANENT").length
  const temporaryCount = citizens.filter((c) => c.residentType === "TEMPORARY").length

  // Client-Side Pagination
  const totalItems = citizens.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const pagedItems = citizens.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getIdentNo = (cit: any) => {
    return cit.nid || cit.birthRegNo || cit.passportNo || "N/A"
  }

  const getIdentType = (cit: any) => {
    if (cit.nid) return "NID"
    if (cit.birthRegNo) return "জন্ম নিবন্ধন"
    if (cit.passportNo) return "পাসপোর্ট"
    return "সনাক্তকরণ নং"
  }

  const handleViewDetails = (id: string) => {
    detailStore.openSheet(id)
  }

  return (
    <div className="space-y-6 font-body">
      {/* Header — Section Title & Primary CTA */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            নাগরিক তথ্য রেজিস্ট্রি
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের নিবন্ধিত সকল নাগরিকের তালিকা দেখুন, প্রোফাইল সংশোধন ও অপসারণ পরিচালনা করুন।
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="rounded-xl h-10 w-10 text-muted-foreground hover:text-foreground cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </Button>
        </div>
      </section>

      {/* State Filter Tabs / Counters */}
      <CitizenKpi
        totalCount={totalCount}
        permanentCount={permanentCount}
        temporaryCount={temporaryCount}
      />

      {/* Filter / Search Panel */}
      <CitizenFilter
        wards={wards}
        setCurrentPage={setCurrentPage}
      />

      {/* Citizens Table Card */}
      <CitizenList
        pagedItems={pagedItems}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
        onViewDetails={handleViewDetails}
        getIdentNo={getIdentNo}
        getIdentType={getIdentType}
      />

      {/* Detail Slide-out Sheet */}
      <CitizenDetailSheet
        onSuccess={refetch}
      />
    </div>
  )
}
