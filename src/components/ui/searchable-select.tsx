import * as React from 'react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SingleProps {
  multiple?: false
  value: string
  onValueChange: (value: string) => void
}

interface MultiProps {
  multiple: true
  value: string[]
  onValueChange: (value: string[]) => void
}

type SearchableSelectProps = (SingleProps | MultiProps) & {
  options: SearchableSelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

// Looks like SelectTrigger (h-10, rounded-sm, Fluent inset shadow), but is type-to-filter.
// Single mode: behaves like Select with search.
// Multi mode: shows comma-joined labels in the field; popup items show check marks.
export function SearchableSelect(props: SearchableSelectProps) {
  const {
    options,
    placeholder = 'Select an option',
    disabled,
    className,
    emptyMessage = 'Nothing found',
  } = props

  const optionsByValue = React.useMemo(() => {
    const map = new Map<string, SearchableSelectOption>()
    for (const opt of options) map.set(opt.value, opt)
    return map
  }, [options])

  // Sync helpers for the controlled item object(s).
  const selectedItems: SearchableSelectOption[] = React.useMemo(() => {
    if (props.multiple) {
      return props.value
        .map((v) => optionsByValue.get(v))
        .filter((o): o is SearchableSelectOption => Boolean(o))
    }
    const single = optionsByValue.get(props.value)
    return single ? [single] : []
  }, [props.multiple, props.value, optionsByValue])

  const singleLabel = !props.multiple ? selectedItems[0]?.label ?? '' : ''
  const [inputValue, setInputValue] = React.useState(singleLabel)

  // Keep input text in sync when the controlled value changes externally (single mode).
  React.useEffect(() => {
    if (!props.multiple) setInputValue(singleLabel)
  }, [props.multiple, singleLabel])

  const multipleLabel = props.multiple
    ? selectedItems.map((o) => o.label).join(', ')
    : ''

  const handleValueChange = (next: unknown) => {
    if (props.multiple) {
      const arr = (next as SearchableSelectOption[] | null) ?? []
      props.onValueChange(arr.map((o) => o.value))
      // Clear the search input after selection in multi mode so user can keep typing.
      setInputValue('')
    } else {
      const item = (next as SearchableSelectOption | null) ?? null
      props.onValueChange(item?.value ?? '')
      if (item) setInputValue(item.label)
    }
  }

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={(props.multiple ? selectedItems : selectedItems[0] ?? null) as never}
      onValueChange={handleValueChange}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringLabel={(item: SearchableSelectOption) => item.label}
      multiple={props.multiple as never}
      disabled={disabled}
    >
      <div
        className={cn(
          // Mirrors SelectTrigger exactly so SearchableSelect is visually a drop-in.
          'flex h-10 w-full items-center justify-between gap-2 rounded-[4px] border border-border-strong bg-background pl-3 pr-2 text-sm leading-5 text-foreground transition-shadow duration-75',
          'shadow-[inset_0_-1px_0_0_var(--color-input-emphasis)] hover:shadow-[inset_0_-2px_0_0_var(--color-input-emphasis)]',
          'focus-within:shadow-[inset_0_-2px_0_0_var(--color-primary)]',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <ComboboxPrimitive.Input
          placeholder={
            props.multiple && selectedItems.length > 0 ? multipleLabel : placeholder
          }
          disabled={disabled}
          className={cn(
            'min-w-0 flex-1 bg-transparent py-2.5 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
            // Multi mode without typing: keep input empty but show summary via placeholder.
            props.multiple && multipleLabel && !inputValue && 'placeholder:text-foreground',
          )}
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
          side="bottom"
          sideOffset={6}
          align="start"
          className="isolate z-50 pointer-events-auto"
        >
          <ComboboxPrimitive.Popup
            className={cn(
              'pointer-events-auto bg-popover text-popover-foreground',
              'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0',
              'relative max-h-96 w-(--anchor-width) overflow-hidden rounded-[4px] border border-border shadow-md',
            )}
          >
            <ComboboxPrimitive.Empty className="hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex">
              {emptyMessage}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="max-h-80 scroll-py-1 overflow-y-auto p-1 overscroll-contain">
              {(item: SearchableSelectOption) => (
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
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
