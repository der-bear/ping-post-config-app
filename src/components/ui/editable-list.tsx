import { useState, type ReactNode } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div data-slot="editable-list" className={cn('space-y-3', className)}>
      {/* Add row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select value={selectedValue} onValueChange={setSelectedValue}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {availableSuggestions.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={!selectedValue}
        >
          Add
        </Button>
      </div>

      {/* List */}
      {heading && (
        <p className="text-sm font-semibold text-foreground">{heading}</p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 px-3 group transition-colors hover:bg-accent/40 border-l-2 border-l-transparent hover:border-l-primary"
            >
              <div className="flex items-center gap-2 min-w-0">
                {renderItem ? renderItem(item) : (
                  <span className="text-sm text-primary cursor-pointer hover:underline truncate">{item.label}</span>
                )}
                {item.warning && (
                  <span className="relative group/tip">
                    <AlertTriangle className="size-4 text-warning shrink-0" />
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 rounded bg-foreground text-background text-xs leading-snug w-56 opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-10">
                      {item.warning}
                    </span>
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-70 hover:!opacity-100 text-muted-foreground"
                aria-label={`Remove ${item.label}`}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
