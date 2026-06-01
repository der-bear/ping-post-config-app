import * as React from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
  searchable?: boolean
  /** When `commitOnConfirm` is true, OK/Cancel control commit; the parent only
   *  receives changes after OK. When false (default), changes commit on each
   *  toggle (like a typical checkbox group). DevExtreme TagBox uses true. */
  commitOnConfirm?: boolean
  /** Cap how many chips render before collapsing the rest into a "+N more" badge.
   *  Default 6. The trigger stays compact when long selections are made. */
  maxVisibleChips?: number
}

// DevExtreme TagBox-style multi-select.
// Field shows chips of selected items (each removable); dropdown shows
// optional search, 'Select All' toggle, checkbox list, and OK/Cancel.
export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select options',
  disabled,
  className,
  emptyMessage = 'Nothing found',
  searchable = true,
  commitOnConfirm = true,
  maxVisibleChips = 6,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<string[]>(value)
  const [search, setSearch] = React.useState('')

  // Sync local draft when popup opens, when options change, or when value updates externally.
  React.useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, searchable, search])

  const visibleValues = filteredOptions.map((o) => o.value)
  const allVisibleSelected =
    visibleValues.length > 0 && visibleValues.every((v) => draft.includes(v))

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setDraft(draft.filter((v) => !visibleValues.includes(v)))
    } else {
      setDraft([...new Set([...draft, ...visibleValues])])
    }
  }

  const toggle = (val: string) => {
    const next = draft.includes(val)
      ? draft.filter((v) => v !== val)
      : [...draft, val]
    if (commitOnConfirm) {
      setDraft(next)
    } else {
      setDraft(next)
      onValueChange(next)
    }
  }

  const handleOk = () => {
    if (commitOnConfirm) onValueChange(draft)
    setOpen(false)
    setSearch('')
  }

  const handleCancel = () => {
    setDraft(value)
    setOpen(false)
    setSearch('')
  }

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = value.filter((v) => v !== val)
    onValueChange(next)
    setDraft(next)
  }

  const selectedItems = options.filter((o) => value.includes(o.value))
  const visibleChips = selectedItems.slice(0, maxVisibleChips)
  const hiddenCount = Math.max(0, selectedItems.length - visibleChips.length)

  return (
    <Popover open={open} onOpenChange={(v) => (disabled ? null : setOpen(v))}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex min-h-10 w-full items-center justify-between gap-2 rounded-[4px] border border-border-strong bg-background pl-2 pr-2 py-1.5 text-sm leading-5 text-left text-foreground transition-shadow duration-75',
            'shadow-[inset_0_-1px_0_0_var(--color-input-emphasis)] hover:shadow-[inset_0_-2px_0_0_var(--color-input-emphasis)]',
            open && 'shadow-[inset_0_-2px_0_0_var(--color-primary)]',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1 min-w-0">
            {selectedItems.length === 0 ? (
              <span className="px-1 text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {visibleChips.map((item) => (
                  <span
                    key={item.value}
                    className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs leading-4 text-foreground max-w-[160px]"
                  >
                    <span className="truncate">{item.label}</span>
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Remove ${item.label}`}
                      onClick={(e) => removeChip(item.value, e)}
                      className="inline-flex size-3.5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </span>
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-xs leading-4 text-text-medium">
                    +{hiddenCount} more
                  </span>
                )}
              </>
            )}
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0 rounded-[4px] border border-border bg-popover shadow-md"
      >
        {searchable && (
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        )}

        {filteredOptions.length === 0 ? (
          <p className="px-3 py-3 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            <label className="flex h-9 cursor-pointer items-center gap-2 border-b border-border px-3 hover:bg-accent">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleAllVisible}
                aria-label="Select all"
              />
              <span className="text-sm font-medium leading-5 text-foreground">Select All</span>
            </label>
            <div className="max-h-72 overflow-y-auto py-1">
              {filteredOptions.map((option) => {
                const checked = draft.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex h-9 cursor-pointer items-center gap-2 px-3 hover:bg-accent',
                      checked && 'bg-accent/40',
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(option.value)}
                      aria-label={option.label}
                    />
                    <span className="text-sm leading-5 text-foreground">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </>
        )}

        {commitOnConfirm && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleOk}>
              OK
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
