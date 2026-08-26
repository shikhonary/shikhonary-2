"use client";

import Link from "next/link";
import { FileText, Edit, MoreHorizontal, Trash2, BookOpen, Clock, Settings, Settings2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";

import { cn } from "@workspace/ui/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  hideOnMobile?: boolean;
  render?: (item: T) => React.ReactNode;
}

const columns: Column<any>[] = [
  {
    key: "title",
    header: "Paper Details",
    render: (paper) => (
      <div className="flex flex-col gap-1">
        <p className="font-bold text-foreground tracking-tight text-sm leading-none">
          {paper.title}
        </p>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="text-[10px] font-medium leading-none">
            {paper.examName}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: "academicClass",
    header: "Class",
    hideOnMobile: true,
    render: (paper) => (
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md">
          {paper.academicClass?.nameBn || "Unknown Class"}
        </Badge>
      </div>
    ),
  },
  {
    key: "stats",
    header: "Stats",
    hideOnMobile: true,
    render: (paper) => (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-foreground">{paper.total} Marks</span>
        </div>
        {paper.timeInMinutes > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{paper.timeInMinutes} Mins</span>
          </div>
        )}
      </div>
    ),
  },
  {
    key: "subjects",
    header: "Subjects",
    hideOnMobile: true,
    render: (paper) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {paper.subjects?.length > 0 ? (
          paper.subjects.map((s: any, idx: number) => (
            <Badge key={idx} variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/30">
              {s.subject?.nameBn || s.subject?.nameEn || "Unknown"}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (paper) => (
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all border-transparent",
          paper.status === "DRAFT" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
        )}
      >
        {paper.status || "DRAFT"}
      </Badge>
    ),
  },
];

interface QuestionPaperTableProps {
  papers: any[];
  isLoading: boolean;
  onDelete: (id: string, title: string) => void;
}

export function QuestionPaperTable({
  papers,
  isLoading,
  onDelete,
}: QuestionPaperTableProps) {
  if (isLoading && papers.length === 0) {
    return (
      <div className="relative flex-grow border-t border-surface-container animate-in fade-in duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "py-3 px-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-outline/5",
                      column.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                <th className="py-3 px-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant text-right border-b border-outline/5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn("px-4 py-4 align-middle", column.hideOnMobile && "hidden md:table-cell")}>
                      <Skeleton className="h-4 w-24 bg-surface-container" />
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right align-middle">
                    <div className="flex justify-end">
                      <Skeleton className="w-10 h-10 rounded-xl bg-surface-container" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl border border-dashed border-border/50 p-16 text-center shadow-soft m-4">
        <div className="size-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50">
          <FileText className="size-10 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No Question Papers Found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          We couldn&apos;t find any papers matching your current filters. Try
          broadening your search parameters or create a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-grow border-t border-surface-container animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "py-3 px-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-outline/5",
                    column.hideOnMobile && "hidden md:table-cell",
                  )}
                >
                  {column.header}
                </th>
              ))}
              <th className="py-3 px-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant text-right border-b border-outline/5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {papers.map((item, index) => (
              <tr
                key={item.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="hover:bg-surface-container-low/30 transition-colors group"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-4 align-middle",
                      column.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {column.render ? column.render(item) : ""}
                  </td>
                ))}
                <td className="px-4 py-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 font-bold hover:bg-primary hover:text-white transition-all text-primary"
                      asChild
                    >
                      <Link href={`/question-papers/${item.id}/build`}>
                        <Settings2 className="w-4 h-4" />
                        Builder
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                          disabled={isLoading}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-52 bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl z-50 rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer rounded-xl font-bold text-sm gap-2.5 p-2.5 transition-colors focus:bg-primary/10 focus:text-primary"
                          asChild
                        >
                          <Link href={`/question-papers/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span>Edit Metadata</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-border/50 my-1.5" />
                        
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive rounded-xl font-bold text-sm gap-2.5 p-2.5 transition-colors focus:bg-destructive/10"
                          onClick={() => onDelete(item.id, item.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Paper</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
