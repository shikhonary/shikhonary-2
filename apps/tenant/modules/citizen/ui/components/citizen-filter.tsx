"use client"

import { useCitizenSearchParams } from "../hooks/use-citizen-search-params"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  MapPin,
  Clock,
  User,
} from "lucide-react"

interface CitizenFilterProps {
  wards: any[]
  setCurrentPage: (page: number) => void
}

export function CitizenFilter({
  wards,
  setCurrentPage,
}: CitizenFilterProps) {
  const [searchParams, setSearchParams] = useCitizenSearchParams()
  const searchQuery = searchParams.search
  const wardFilter = searchParams.wardId
  const residentTypeFilter = searchParams.residentType
  const sortFilter = searchParams.sort

  const setSearchQuery = (val: string) => setSearchParams({ search: val })
  const setWardFilter = (val: string) => setSearchParams({ wardId: val })
  const setResidentTypeFilter = (val: string) => setSearchParams({ residentType: val })
  const setSortFilter = (val: string) => setSearchParams({ sort: val })

  const resetFilters = () => {
    setCurrentPage(1)
    setSearchParams({
      search: "",
      wardId: "all",
      residentType: "all",
      sort: "newest",
    })
  }

  return (
    <div className="space-y-3">
      {/* Primary Filter Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs p-3 sm:p-4 font-body">
        {/* Search Input Filter */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="নাগরিক নাম, মোবাইল, NID বা Citizen ID খুঁজুন..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-xl border border-border bg-muted/30 py-2.5 pl-10 pr-4 font-body text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all"
          />
        </div>

        {/* Mobile Filter Drawer Button (md:hidden) */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="md:hidden flex items-center gap-2 h-10 px-3.5 bg-muted/30 border-border text-foreground text-xs font-medium shrink-0 rounded-xl cursor-pointer hover:bg-muted/50"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {(wardFilter !== "all" || residentTypeFilter !== "all" || sortFilter !== "newest") && (
                <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {(wardFilter !== "all" ? 1 : 0) + (residentTypeFilter !== "all" ? 1 : 0) + (sortFilter !== "newest" ? 1 : 0)}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="p-0 border-t border-border bg-card shadow-2xl rounded-t-3xl overflow-hidden text-foreground">
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <DrawerTitle className="font-display text-base font-bold text-primary-foreground">
                    ফিল্টার অ্যান্ড সর্ট
                  </DrawerTitle>
                  <DrawerDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                    নাগরিক তালিকা ওয়ার্ড, বাসিন্দা ধরন ও সর্টিং অনুযায়ী ফিল্টার করুন
                  </DrawerDescription>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-4 font-body">
                {/* Ward Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    ওয়ার্ড নির্বাচন
                  </label>
                  <Select
                    value={wardFilter}
                    onValueChange={(val) => {
                      setWardFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সকল ওয়ার্ড" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
                      {wards.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.nameBn || w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resident Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <User className="h-3.5 w-3.5 text-primary" />
                    বাসিন্দা ধরন
                  </label>
                  <Select
                    value={residentTypeFilter}
                    onValueChange={(val) => {
                      setResidentTypeFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সকল বাসিন্দা ধরন" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="all">সকল বাসিন্দা ধরন</SelectItem>
                      <SelectItem value="PERMANENT">স্থায়ী বাসিন্দা</SelectItem>
                      <SelectItem value="TEMPORARY">অস্থায়ী বাসিন্দা</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Option */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 font-display">
                    <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    সাজানোর পদ্ধতি
                  </label>
                  <Select
                    value={sortFilter}
                    onValueChange={(val) => {
                      setSortFilter(val)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="সর্বশেষ" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                      <SelectItem value="newest">সর্বশেষ</SelectItem>
                      <SelectItem value="oldest">সবচেয়ে পুরানো</SelectItem>
                      <SelectItem value="name_asc">নাম (A-Z)</SelectItem>
                      <SelectItem value="name_desc">নাম (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="px-0 pt-4 flex-row gap-3">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1 rounded-xl h-11 text-xs">
                    বন্ধ করুন
                  </Button>
                </DrawerClose>
                <Button
                  onClick={resetFilters}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-11 text-xs font-bold"
                >
                  রিসেট করুন
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Desktop Filters (md:flex) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Ward filter Select */}
          <Select
            value={wardFilter}
            onValueChange={(val) => {
              setWardFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36 lg:w-44 rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all">
              <SelectValue placeholder="সকল ওয়ার্ড" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              <SelectItem value="all">সকল ওয়ার্ড</SelectItem>
              {wards.map((w: any) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.nameBn || w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Resident Type Select */}
          <Select
            value={residentTypeFilter}
            onValueChange={(val) => {
              setResidentTypeFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36 lg:w-44 rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all">
              <SelectValue placeholder="বাসিন্দা ধরন" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              <SelectItem value="all">সকল বাসিন্দা ধরন</SelectItem>
              <SelectItem value="PERMANENT">স্থায়ী বাসিন্দা</SelectItem>
              <SelectItem value="TEMPORARY">অস্থায়ী বাসিন্দা</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select
            value={sortFilter}
            onValueChange={(val) => {
              setSortFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36 lg:w-44 rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 h-10 transition-all">
              <SelectValue placeholder="সর্বশেষ" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              <SelectItem value="newest">সর্বশেষ</SelectItem>
              <SelectItem value="oldest">সবচেয়ে পুরানো</SelectItem>
              <SelectItem value="name_asc">নাম (A-Z)</SelectItem>
              <SelectItem value="name_desc">নাম (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters Trigger */}
          {(searchQuery !== "" || wardFilter !== "all" || residentTypeFilter !== "all" || sortFilter !== "newest") && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/40 text-xs font-semibold h-10 px-3 rounded-xl transition-all"
            >
              <X className="h-3.5 w-3.5 mr-1 text-rose-500" />
              রিসেট
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(searchQuery !== "" || wardFilter !== "all" || residentTypeFilter !== "all" || sortFilter !== "newest") && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 font-body text-xs">
          <span className="text-muted-foreground mr-1">সক্রিয় ফিল্টার:</span>
          {searchQuery && (
            <Badge variant="secondary" className="rounded-lg gap-1 border border-border bg-card">
              সার্চ: &quot;{searchQuery}&quot;
              <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSearchQuery("")} />
            </Badge>
          )}
          {wardFilter !== "all" && (
            <Badge variant="secondary" className="rounded-lg gap-1 border border-border bg-card">
              ওয়ার্ড: {wards.find(w => w.id === wardFilter)?.nameBn || wardFilter}
              <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setWardFilter("all")} />
            </Badge>
          )}
          {residentTypeFilter !== "all" && (
            <Badge variant="secondary" className="rounded-lg gap-1 border border-border bg-card">
              বাসিন্দা: {residentTypeFilter === "PERMANENT" ? "স্থায়ী" : "অস্থায়ী"}
              <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setResidentTypeFilter("all")} />
            </Badge>
          )}
          {sortFilter !== "newest" && (
            <Badge variant="secondary" className="rounded-lg gap-1 border border-border bg-card">
              ক্রম: {sortFilter === "oldest" ? "সবচেয়ে পুরানো" : sortFilter === "name_asc" ? "নাম A-Z" : "নাম Z-A"}
              <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSortFilter("newest")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
