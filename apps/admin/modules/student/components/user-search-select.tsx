"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@workspace/ui/components/command"
import { Button } from "@workspace/ui/components/button"
import { Check, ChevronsUpDown, User, Loader2 } from "lucide-react"

interface UserSearchSelectProps {
  value: string | null | undefined
  onChange: (val: string | null) => void
  disabled?: boolean
}

export function UserSearchSelect({
  value,
  onChange,
  disabled = false,
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Inline debounce effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [search])

  // Server-side query for finding users (LIMIT 5)
  const { data: users = [], isLoading: isListLoading } = useQuery({
    ...trpc.user.forSelection.queryOptions({
      query: debouncedSearch || undefined,
      limit: 5,
    }),
    enabled: open, // only fetch when dropdown is open
  })

  // Fetch the selected user specifically if we have a value, to display their details
  const { data: selectedUser, isLoading: isSelectedUserLoading } = useQuery({
    ...trpc.user.byId.queryOptions({ id: value || "" }),
    enabled: Boolean(value),
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-lg border border-outline-variant bg-white py-2.5 sm:py-3 px-4 font-body-md text-sm text-on-surface hover:bg-surface-container-low transition-all h-auto cursor-pointer font-normal"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="h-4 w-4 text-outline shrink-0" />
            {isSelectedUserLoading ? (
              <span className="text-on-surface-variant/70 truncate animate-pulse">
                Loading linked user details...
              </span>
            ) : selectedUser ? (
              <span className="truncate font-medium text-on-surface">
                {selectedUser.name || "Unnamed"} ({selectedUser.email || selectedUser.phoneNumber || "No Contact"})
              </span>
            ) : !value || value === "none" ? (
              <span className="text-on-surface-variant/70 truncate">
                Standalone Student (No user link)
              </span>
            ) : (
              <span className="text-on-surface-variant/70 truncate">
                Select Portal User Profile
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-outline" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-outline-variant shadow-lg rounded-xl z-50">
        <Command shouldFilter={false}>
          <div className="relative">
            <CommandInput
              placeholder="Search user by name, email, or phone..."
              value={search}
              onValueChange={setSearch}
              className="h-10 text-sm pr-8"
            />
            {isListLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-outline" />
              </span>
            )}
          </div>
          <CommandList className="max-h-60 overflow-y-auto p-1">
            <CommandEmpty>
              {isListLoading ? "Searching..." : "No matching user accounts found."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-on-surface">Standalone Student (No user link)</span>
                </div>
                {(!value || value === "none") && (
                  <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                )}
              </CommandItem>

              {users.map((u) => {
                const isSelected = value === u.id
                return (
                  <CommandItem
                    key={u.id}
                    value={u.id}
                    onSelect={() => {
                      onChange(u.id)
                      setOpen(false)
                    }}
                    className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container-high flex items-center justify-between"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-on-surface truncate">
                        {u.name || "Unnamed User"}
                      </span>
                      <span className="text-[11px] text-outline truncate">
                        {u.email || u.phoneNumber || "No contact details"}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
