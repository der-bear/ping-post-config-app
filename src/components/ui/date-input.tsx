import * as React from 'react'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const DISPLAY_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

function toDisplayValue(value: string) {
  const match = value.match(ISO_DATE)
  if (!match) return value

  return `${Number(match[2])}/${Number(match[3])}/${match[1]}`
}

function toNativeValue(value: string) {
  if (ISO_DATE.test(value)) return value

  const match = value.match(DISPLAY_DATE)
  if (!match) return ''

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return ''
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange'
  > {
  value: string
  onValueChange: (value: string) => void
  pickerLabel?: string
}

export function DateInput({
  value,
  onValueChange,
  pickerLabel = 'Choose date',
  placeholder = 'M/D/YYYY',
  className,
  disabled,
  ...props
}: DateInputProps) {
  const nativeInputRef = React.useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const nativeInput = nativeInputRef.current as
      | (HTMLInputElement & { showPicker?: () => void })
      | null

    if (!nativeInput) return

    try {
      if (nativeInput.showPicker) {
        nativeInput.showPicker()
      } else {
        nativeInput.click()
      }
    } catch {
      nativeInput.focus()
      nativeInput.click()
    }
  }

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        value={toDisplayValue(value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('pr-10', className)}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={pickerLabel}
        disabled={disabled}
        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
        onClick={openPicker}
      >
        <CalendarDays aria-hidden="true" />
      </Button>
      <input
        ref={nativeInputRef}
        type="date"
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        value={toNativeValue(value)}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  )
}
