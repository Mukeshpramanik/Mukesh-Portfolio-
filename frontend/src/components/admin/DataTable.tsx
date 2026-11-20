'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    onClick?: () => void;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  className?: string;
  headerAction?: React.ReactNode;
}

type SortOrder = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display at this time.',
  emptyAction,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKeys,
  className,
  headerAction,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Handle column sorting toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else if (sortOrder === 'desc') {
        setSortKey(null);
        setSortOrder(null);
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchKeys && searchKeys.length > 0) {
          return searchKeys.some((k) => {
            const val = item[k];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
        }
        return Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(q);
          }
          if (Array.isArray(val)) {
            return val.some((sub) => String(sub).toLowerCase().includes(q));
          }
          return false;
        });
      });
    }

    // Column sorting
    if (sortKey && sortOrder) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valA === null) return sortOrder === 'asc' ? 1 : -1;
        if (valB === undefined || valB === null) return sortOrder === 'asc' ? -1 : 1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        return sortOrder === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortOrder, searchKeys]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Table Toolbar */}
      {(searchable || headerAction) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {searchable ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-surface-elevated/80 border border-border/80 rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          ) : (
            <div />
          )}

          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-hidden rounded-2xl border border-border/70 bg-surface/70 backdrop-blur-xl shadow-lg shadow-black/10">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/70 bg-surface-elevated/60 text-xs font-semibold text-muted uppercase tracking-wider">
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={cn(
                        'px-5 py-3.5 select-none transition-colors',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.sortable &&
                          'cursor-pointer hover:text-foreground hover:bg-surface-elevated',
                        col.className
                      )}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          col.align === 'center' && 'justify-center w-full',
                          col.align === 'right' && 'justify-end w-full'
                        )}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-muted/70">
                            {isSorted ? (
                              sortOrder === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-violet-400" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: skeletonRows }).map((_, rIdx) => (
                  <tr key={`skel-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skel-${rIdx}-${cIdx}`} className="px-5 py-4">
                        <Skeleton
                          variant="text"
                          className="h-4 w-3/4 max-w-[140px]"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : processedData.length === 0 ? (
                // Empty state inside table
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <EmptyState
                      title={emptyTitle}
                      description={
                        searchQuery
                          ? `No results found for "${searchQuery}". Try modifying your search query.`
                          : emptyDescription
                      }
                      action={
                        emptyAction
                          ? {
                              label: emptyAction.label,
                              onClick: emptyAction.onClick,
                            }
                          : undefined
                      }
                      className="bg-transparent border-none shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                // Rendered Data Rows
                processedData.map((item, index) => {
                  const key = keyExtractor
                    ? keyExtractor(item, index)
                    : item.id !== undefined
                    ? item.id
                    : index;

                  return (
                    <tr
                      key={key}
                      className="group hover:bg-surface-elevated/40 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={`${key}-${col.key}`}
                          className={cn(
                            'px-5 py-4 align-middle text-sm text-foreground/90 transition-colors',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right',
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(item, index)
                            : item[col.key] !== undefined && item[col.key] !== null
                            ? String(item[col.key])
                            : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        {!isLoading && processedData.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/50 bg-surface-elevated/30 text-xs text-muted">
            <span>
              Showing {processedData.length} of {data.length} entries
            </span>
            {searchQuery && (
              <span className="text-violet-400">
                Filtered from total {data.length} items
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
