"use client"

import * as React from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export interface DataTableSkeletonProps {
  columns: number
  rows?: number
  className?: string
}

export function DataTableSkeleton({
  columns,
  rows = 5,
  className,
}: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className={className}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-4 py-3.5">
              <Skeleton
                className={`h-4 ${
                  colIndex === 0
                    ? "w-24 sm:w-32"
                    : colIndex === columns - 1
                    ? "w-16 ml-auto"
                    : "w-28 sm:w-40"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
