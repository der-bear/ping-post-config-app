import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock } from 'lucide-react'
import type { DeliveryScheduleConfig } from '@/features/delivery-method/types'

const DAYS: { key: keyof DeliveryScheduleConfig; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

function TimeField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = useCallback(() => {
    inputRef.current?.showPicker()
  }, [])

  return (
    <div className={cn(
      "flex items-center h-10 rounded-[4px] border border-border-strong bg-background overflow-hidden",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 min-w-0 h-full bg-transparent px-3 text-sm text-foreground outline-none border-0 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className="shrink-0 flex items-center justify-center w-8 h-8 mr-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded disabled:pointer-events-none disabled:opacity-50"
      >
        <Clock className="h-5 w-5" />
      </button>
    </div>
  )
}

export function DeliverySchedule() {
  const schedule = useDeliveryMethodStore((s) => s.config.deliverySchedule)
  const updateDeliverySchedule = useDeliveryMethodStore(
    (s) => s.updateDeliverySchedule,
  )

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const daySchedule = schedule[day.key]
        return (
          <div key={day.key}>
            {/* Row 1: Day name + From/To labels */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              <span className="text-sm text-foreground">
                {day.label}
              </span>
              <span className="text-sm text-foreground">From</span>
              <span className="text-sm text-foreground">To</span>
            </div>
            {/* Row 2: Enabled select + time pickers */}
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={daySchedule.enabled ? 'enabled' : 'disabled'}
                onValueChange={(value) =>
                  updateDeliverySchedule(day.key, {
                    enabled: value === 'enabled',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <TimeField
                value={daySchedule.from}
                onChange={(v) =>
                  updateDeliverySchedule(day.key, { from: v })
                }
                disabled={!daySchedule.enabled}
              />
              <TimeField
                value={daySchedule.to}
                onChange={(v) =>
                  updateDeliverySchedule(day.key, { to: v })
                }
                disabled={!daySchedule.enabled}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
