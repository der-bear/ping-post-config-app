import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectBoxOption {
  value: string
  label: string
}

interface SelectBoxProps {
  options: SelectBoxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
  /** When true, renders a type-to-filter combobox. When false (default), renders
   *  a plain Radix Select. Use `searchable` for dynamic/long lists; keep it off
   *  for fixed enum selects. */
  searchable?: boolean
}

// Single-select dropdown. Same trigger styling either way.
// Multi-select is intentionally a separate component (MultiSelect — planned).
export function SelectBox({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  disabled,
  className,
  emptyMessage = 'Nothing found',
  searchable = false,
}: SelectBoxProps) {
  if (!searchable) {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return <SearchableImpl
    options={options}
    value={value}
    onValueChange={onValueChange}
    placeholder={placeholder}
    disabled={disabled}
    className={className}
    emptyMessage={emptyMessage}
  />
}

function SearchableImpl({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  emptyMessage,
}: Omit<SelectBoxProps, 'searchable'>) {
  const optionsByValue = React.useMemo(() => {
    const map = new Map<string, SelectBoxOption>()
    for (const opt of options) map.set(opt.value, opt)
    return map
  }, [options])

  const selectedItem = optionsByValue.get(value) ?? null
  const selectedLabel = selectedItem?.label ?? ''
  const [inputValue, setInputValue] = React.useState(selectedLabel)
  // Anchor the popup to the full field box (input + chevron) so the popover
  // width and left edge align exactly with the visible trigger.
  const fieldRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setInputValue(selectedLabel)
  }, [selectedLabel])

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selectedItem}
      onValueChange={(item: SelectBoxOption | null) => {
        onValueChange(item?.value ?? '')
        if (item) setInputValue(item.label)
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringLabel={(item: SelectBoxOption) => item.label}
      disabled={disabled}
    >
      <div
        ref={fieldRef}
        className={cn(
          // Mirrors SelectTrigger exactly so the field is visually a drop-in.
          'flex h-10 w-full items-center justify-between gap-2 rounded-[4px] border border-border-strong bg-background pl-3 pr-2 text-sm leading-5 text-foreground transition-shadow duration-75',
          'shadow-[inset_0_-1px_0_0_var(--color-input-emphasis)] hover:shadow-[inset_0_-2px_0_0_var(--color-input-emphasis)]',
          'focus-within:shadow-[inset_0_-2px_0_0_var(--color-primary)]',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <ComboboxPrimitive.Input
          placeholder={placeholder}
          disabled={disabled}
          onFocus={(e) => {
            // Select all so the first keystroke replaces the current label
            // rather than appending to it.
            e.currentTarget.select()
          }}
          className="min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
        <ComboboxPrimitive.Trigger
          className="inline-flex size-5 shrink-0 items-center justify-center text-muted-foreground opacity-50 hover:opacity-100"
          aria-label="Toggle options"
        >
          <ChevronDown className="size-4" />
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          anchor={fieldRef}
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50 pointer-events-auto"
        >
          <ComboboxPrimitive.Popup
            className={cn(
              'group/sb-popup pointer-events-auto bg-popover text-popover-foreground',
              'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0',
              'relative w-(--anchor-width) min-w-[var(--anchor-width)] overflow-hidden rounded-[4px] border border-border shadow-md',
            )}
          >
            <ComboboxPrimitive.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 overscroll-contain">
              {(item: SelectBoxOption) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className={cn(
                    'relative flex w-full cursor-default items-center gap-2 rounded-sm py-2 pr-8 pl-3 text-sm outline-hidden select-none',
                    'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  )}
                >
                  {item.label}
                  <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <Check className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
            <ComboboxPrimitive.Empty className="px-3 py-3 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </ComboboxPrimitive.Empty>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
