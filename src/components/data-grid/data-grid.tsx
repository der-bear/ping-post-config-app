import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import type { DataGridColumn, SortState } from './types'

interface DataGridProps<T extends { id: string }> {
  columns: DataGridColumn<T>[]
  data: T[]
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  onRowDoubleClick?: (row: T) => void
  toolbar?: ReactNode
  footer?: ReactNode
  emptyMessage?: string
  className?: string
}

export function DataGrid<T extends { id: string }>({
  columns,
  data,
  selectedIds = new Set(),
  onSelectionChange,
  onRowDoubleClick,
  toolbar,
  footer,
  emptyMessage = 'No data',
  className,
}: DataGridProps<T>) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: null })
  const lastClickedIndex = useRef<number>(-1)

  const handleSort = useCallback((columnKey: string) => {
    setSort((prev) => {
      if (prev.column !== columnKey) return { column: columnKey, direction: 'asc' }
      if (prev.direction === 'asc') return { column: columnKey, direction: 'desc' }
      return { column: null, direction: null }
    })
  }, [])

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return data
    const col = sort.column as keyof T
    return [...data].sort((a, b) => {
      const aVal = String(a[col] ?? '')
      const bVal = String(b[col] ?? '')
      const cmp = aVal.localeCompare(bVal)
      return sort.direction === 'asc' ? cmp : -cmp
    })
  }, [data, sort])

  const handleRowClick = useCallback(
    (index: number, id: string, e: React.MouseEvent) => {
      if (!onSelectionChange) return
      const next = new Set(selectedIds)
      if (e.shiftKey && lastClickedIndex.current >= 0) {
        const from = Math.min(lastClickedIndex.current, index)
        const to = Math.max(lastClickedIndex.current, index)
        for (let i = from; i <= to; i++) {
          next.add(sortedData[i].id)
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      } else {
        next.clear()
        next.add(id)
      }
      lastClickedIndex.current = index
      onSelectionChange(next)
    },
    [selectedIds, onSelectionChange, sortedData],
  )

  const getSortIcon = (columnKey: string) => {
    if (sort.column !== columnKey) return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
    if (sort.direction === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-primary" />
    return <ArrowDown className="h-3.5 w-3.5 text-primary" />
  }

  return (
    <div className={cn('flex flex-col min-h-0', className)}>
      {toolbar && (
        <div className="flex items-center gap-1 px-1 py-2 border-b border-border">
          {toolbar}
        </div>
      )}
      <div className="overflow-auto flex-1 min-h-0">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left px-3 py-3 text-xs font-semibold text-foreground select-none bg-background sticky top-0 z-10 border-b border-border',
                    col.sortable && 'cursor-pointer hover:bg-accent',
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-2">
                    {col.header}
                    {col.sortable && getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-xs text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    'cursor-pointer',
                    selectedIds.has(row.id) ? 'bg-primary-light' : 'hover:bg-accent',
                  )}
                  onClick={(e) => handleRowClick(index, row.id, e)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-xs text-foreground truncate max-w-0 border-b border-border">
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
          {footer}
        </div>
      )}
    </div>
  )
}
