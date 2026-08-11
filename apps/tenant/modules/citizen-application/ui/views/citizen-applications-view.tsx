"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { RefreshCw, UserPlus } from "lucide-react"

import { useCitizenApplicationSearchParams } from "../hooks/use-citizen-application-search-params"
import { CitizenApplicationKpi } from "../components/citizen-application-kpi"
import { CitizenApplicationFilter } from "../components/citizen-application-filter"
import { CitizenApplicationList } from "../components/citizen-application-list"
import { CitizenApplicationDetailSheet } from "../modal/citizen-application-detail-sheet"
import { useCitizenApplicationDetailStore } from "../store/use-citizen-application-detail-store"

export function CitizenApplicationsView() {
  const detailStore = useCitizenApplicationDetailStore()

  // Search parameters managed in URL via nuqs
  const [searchParams, setSearchParams] = useCitizenApplicationSearchParams()
  const searchQuery = searchParams.search
  const wardFilter = searchParams.wardId
  const statusFilter = searchParams.status
  const sortFilter = searchParams.sort


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Fetch Wards for filtering
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  // Fetch Applications List
  const { data: applicationsData, isLoading, isError, refetch } = useQuery(
    trpc.citizenApplication.list.queryOptions({
      limit: 100,
      search: searchQuery.trim() || undefined,
      wardId: wardFilter === "all" ? undefined : wardFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      sort: sortFilter === "all" ? undefined : (sortFilter as any),
    })
  )
  const applications = applicationsData?.applications || []

  // Derived counts for quick stats
  const totalCount = applications.length
  const pendingCount = applications.filter((app) => app.status === "PENDING").length
  const approvedCount = applications.filter((app) => app.status === "APPROVED").length
  const rejectedCount = applications.filter((app) => app.status === "REJECTED").length

  // Client-Side Pagination
  const totalItems = applications.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const pagedItems = applications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )


  const getIdentNo = (app: any) => {
    return app.nid || app.birthRegNo || app.passportNo || "N/A"
  }

  const getIdentType = (app: any) => {
    if (app.nid) return "NID"
    if (app.birthRegNo) return "জন্ম নিবন্ধন"
    if (app.passportNo) return "পাসপোর্ট"
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
            নাগরিক আবেদন ব্যবস্থাপনা
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground">
            ইউনিয়ন পরিষদের নতুন নাগরিক আবেদনের তালিকা, প্রোফাইল যাচাইকরণ ও অনুমোদন পরিচালনা করুন।
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            asChild
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 sm:py-3 font-display text-sm sm:text-base font-bold text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden h-auto"
          >
            <Link href="/citizen-applications/new">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:scale-110" />
              <span className="relative z-10">নতুন নাগরিক আবেদন</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* State Filter Tabs / Counters */}
      <CitizenApplicationKpi
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
      />

      {/* Filter / Search Panel */}
      <CitizenApplicationFilter
        wards={wards}
        setCurrentPage={setCurrentPage}
      />

      {/* Applications Table Card */}
      <CitizenApplicationList
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
      <CitizenApplicationDetailSheet
        onSuccess={refetch}
      />
    </div>
  )
}
