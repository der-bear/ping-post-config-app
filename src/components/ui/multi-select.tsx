import * as React from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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
  searchInTrigger?: boolean
  ariaLabel?: string
  ariaInvalid?: boolean
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
  searchInTrigger = false,
  ariaLabel,
  ariaInvalid,
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
  const someVisibleSelected = visibleValues.some((v) => draft.includes(v))

  const setNextValue = (next: string[]) => {
    setDraft(next)
    if (!commitOnConfirm) onValueChange(next)
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setNextValue(draft.filter((v) => !visibleValues.includes(v)))
    } else {
      setNextValue([...new Set([...draft, ...visibleValues])])
    }
  }

  const toggle = (val: string) => {
    const next = draft.includes(val)
      ? draft.filter((v) => v !== val)
      : [...draft, val]
    setNextValue(next)
    if (searchInTrigger) setSearch('')
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

  const chips = (
    <>
      {visibleChips.map((item) => (
        <span
          key={item.value}
          className="inline-flex max-w-[160px] items-center gap-0.5 rounded-[10px] border border-border bg-muted/40 py-0.5 pl-2 pr-1 text-xs leading-4 text-foreground"
        >
          <span className="truncate">{item.label}</span>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Remove ${item.label}`}
            onClick={(e) => removeChip(item.value, e)}
            className="inline-flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-[10px] border border-border bg-muted/40 px-2 py-0.5 text-xs leading-4 text-text-medium">
          +{hiddenCount} more
        </span>
      )}
    </>
  )

  const triggerClassName = cn(
    'flex min-h-10 w-full items-center gap-2 rounded-[4px] border border-border-strong bg-background px-2 py-1.5 text-left text-sm leading-5 text-foreground transition-shadow duration-75',
    'shadow-[inset_0_-1px_0_0_var(--color-input-emphasis)] hover:shadow-[inset_0_-2px_0_0_var(--color-input-emphasis)]',
    open && 'shadow-[inset_0_-2px_0_0_var(--color-primary)]',
    ariaInvalid && 'border-destructive',
    disabled && 'cursor-not-allowed opacity-50',
    className,
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return
    setOpen(nextOpen)
    if (!nextOpen) setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {searchInTrigger ? (
        <PopoverAnchor asChild>
          <div className={triggerClassName} onClick={() => !disabled && setOpen(true)}>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {chips}
              <input
                type="text"
                role="combobox"
                aria-label={ariaLabel}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-invalid={ariaInvalid}
                disabled={disabled}
                value={search}
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setOpen(true)
                }}
                placeholder={selectedItems.length === 0 ? placeholder : undefined}
                className="h-6 min-w-[72px] flex-1 bg-transparent px-1 text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            className={cn(triggerClassName, 'justify-between')}
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {selectedItems.length === 0 ? (
                <span className="px-1 text-muted-foreground">{placeholder}</span>
              ) : (
                chips
              )}
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50" />
          </button>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        sideOffset={searchInTrigger ? 0 : 6}
        onOpenAutoFocus={(event) => searchInTrigger && event.preventDefault()}
        className="w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0 rounded-[4px] border border-border bg-popover shadow-md"
      >
        {searchable && !searchInTrigger && (
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
                checked={allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false}
                onCheckedChange={toggleAllVisible}
                aria-label="Select all"
              />
              <span className="text-sm leading-5 text-foreground">Select All</span>
            </label>
            <div className={cn(
              'overflow-y-auto overscroll-contain py-1',
              searchInTrigger
                ? 'max-h-[min(658px,var(--radix-popover-content-available-height))] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary'
                : 'max-h-72',
            )}>
              {filteredOptions.map((option) => {
                const checked = draft.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={cn(
                      'flex h-9 cursor-pointer items-center gap-2 px-3 hover:bg-accent',
                      checked && !searchInTrigger && 'bg-accent/40',
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
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <span className="text-xs leading-4 text-text-medium">
              {draft.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleOk}>
                OK
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
