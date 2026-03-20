import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'

interface YesNoSelectProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export function YesNoSelect({ value, onValueChange, disabled, className }: YesNoSelectProps) {
  return (
    <Select
      value={value ? 'yes' : 'no'}
      onValueChange={(v) => onValueChange(v === 'yes')}
      disabled={disabled}
    >
      <SelectTrigger data-slot="yes-no-select" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="yes">Yes</SelectItem>
        <SelectItem value="no">No</SelectItem>
      </SelectContent>
    </Select>
  )
}
