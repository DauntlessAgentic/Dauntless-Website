"use client";
import React, { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, flexRender, type ColumnDef,
  type SortingState, type ColumnFiltersState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "accent" | "success" | "warning" | "danger" | "default"> = {
  active:   "accent",
  complete: "success",
  pending:  "warning",
  blocked:  "danger",
};

const priorityVariant: Record<string, "danger" | "warning" | "default"> = {
  high:   "danger",
  medium: "warning",
  low:    "default",
};

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export function DataTable<T>({
  data, columns, searchable = true,
  searchPlaceholder = "Search...", className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {searchable && (
        <div className="px-3 py-2 border-b border-[--border-subtle] shrink-0">
          <Input
            icon={<Search className="h-3.5 w-3.5" />}
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-7"
          />
        </div>
      )}
      <ScrollArea className="flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[--panel-bg] z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[--border-subtle]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[--text-muted]",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-[--text-secondary]"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-[--text-muted]">
                          {header.column.getIsSorted() === "asc"  ? <ChevronUp className="h-3 w-3" />   :
                           header.column.getIsSorted() === "desc" ? <ChevronDown className="h-3 w-3" /> :
                           <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[--border-subtle] hover:bg-[--elevated] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-[--text-secondary]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <div className="px-3 py-1.5 border-t border-[--border-subtle] text-[10px] text-[--text-muted] shrink-0">
        {table.getFilteredRowModel().rows.length} of {data.length} rows
      </div>
    </div>
  );
}

// Pre-built columns for tableData
export const defaultTableColumns: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID", size: 80,
    cell: ({ getValue }) => (
      <span className="font-mono text-[10px] text-[--text-muted]">{getValue() as string}</span>
    ),
  },
  { accessorKey: "name", header: "Name",
    cell: ({ getValue }) => (
      <span className="text-[--text-primary] font-medium">{getValue() as string}</span>
    ),
  },
  { accessorKey: "status", header: "Status",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <Badge variant={statusVariant[v] || "default"}>{v}</Badge>;
    },
  },
  { accessorKey: "priority", header: "Priority",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <Badge variant={priorityVariant[v] || "default"}>{v}</Badge>;
    },
  },
  { accessorKey: "assignee", header: "Assignee",
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  { accessorKey: "score", header: "Score", size: 60,
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 max-w-[48px] h-1 rounded-full bg-[--elevated-2] overflow-hidden">
          <div
            className="h-full rounded-full bg-[--accent-bright]"
            style={{ width: `${getValue()}%` }}
          />
        </div>
        <span className="tabular-nums text-[--text-primary]">{getValue() as number}</span>
      </div>
    ),
  },
];
