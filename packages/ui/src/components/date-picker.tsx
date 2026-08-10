"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-body text-sm font-normal rounded-xl border border-border py-2.5 px-3.5 h-11 bg-muted/30 text-foreground hover:bg-muted/50 hover:text-foreground transition-all focus:border-primary/40 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground shrink-0" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border border-border bg-popover shadow-xl rounded-2xl overflow-hidden" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
