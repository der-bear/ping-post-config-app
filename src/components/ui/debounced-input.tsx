import { forwardRef, useState, useEffect } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from './input'

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value: string
  onValueCommit: (value: string) => void
}

/**
 * Input that buffers keystrokes in local state and commits to the store on blur.
 * Eliminates per-keystroke Zustand writes for snappy typing in autosave panels.
 */
const DebouncedInput = forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onValueCommit, onChange, onBlur, className, ...props }, ref) => {
    const [local, setLocal] = useState(value)

    // Sync when external value changes (e.g. PING→POST sync)
    useEffect(() => { setLocal(value) }, [value])

    return (
      <Input
        ref={ref}
        data-slot="debounced-input"
        className={className}
        {...props}
        value={local}
        onChange={(e) => {
          setLocal(e.target.value)
          onChange?.(e)
        }}
        onBlur={(e) => {
          if (local !== value) onValueCommit(local)
          onBlur?.(e)
        }}
      />
    )
  },
)
DebouncedInput.displayName = 'DebouncedInput'

export { DebouncedInput }
