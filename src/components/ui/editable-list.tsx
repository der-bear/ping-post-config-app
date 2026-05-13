import { useState, type ReactNode } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'

export interface EditableListItem {
  id: string
  label: string
  warning?: string
  href?: string
}

interface EditableListProps {
  items: EditableListItem[]
  onAdd: (value: string) => void
  onRemove: (id: string) => void
  placeholder?: string
  suggestions: { value: string; label: string }[]
  heading?: string
  emptyMessage?: string
  renderItem?: (item: EditableListItem) => ReactNode
  className?: string
}

export function EditableList({
  items,
  onAdd,
  onRemove,
  placeholder = 'Select an item to add',
  suggestions,
  heading,
  emptyMessage = 'No items added',
  renderItem,
  className,
}: EditableListProps) {
  const [selectedValue, setSelectedValue] = useState('')

  const availableSuggestions = suggestions.filter(
    s => !items.some(item => item.id === s.value)
  )

  const handleAdd = () => {
    if (selectedValue) {
      onAdd(selectedValue)
      setSelectedValue('')
    }
  }

  return (
    <div data-slot="editable-list" className={cn('flex flex-col gap-4', className)}>
      {/* Add row — searchable select + Add button */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchableSelect
            options={availableSuggestions}
            value={selectedValue}
            onValueChange={setSelectedValue}
            placeholder={placeholder}
            emptyMessage="No clients found"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={!selectedValue}
          className="w-20"
        >
          Add
        </Button>
      </div>

      {/* Buyers table — bordered container per Figma 3617:11201 */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
      ) : (
        <div className="rounded-[4px] border border-border bg-background overflow-hidden">
          {heading && (
            <div className="flex items-center h-9 px-3 border-b border-border">
              <span className="text-sm font-semibold leading-5 text-foreground">{heading}</span>
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center justify-between h-10 px-3 transition-colors hover:bg-background-tertiary',
                  idx < items.length - 1 && 'border-b border-border',
                )}
              >
                <div className="flex items-center gap-1 min-w-0">
                  {renderItem ? renderItem(item) : (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-sm leading-5 text-info-link underline decoration-solid cursor-pointer truncate hover:text-info-link-hover"
                    >
                      {item.label}
                    </a>
                  )}
                  {item.warning && (
                    <span className="relative group/tip ml-1">
                      <AlertTriangle className="size-3 text-warning shrink-0" />
                      <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded bg-tooltip text-tooltip-foreground text-xs leading-4 w-48 opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-10">
                        {item.warning}
                      </span>
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(item.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${item.label}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
