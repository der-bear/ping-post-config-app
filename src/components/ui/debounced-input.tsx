import { forwardRef, useState, useEffect } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from './input'

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onValueCommit: (value: string) => void
}

/**
 * Input that buffers keystrokes in local state and commits to the store on blur.
 * Eliminates per-keystroke Zustand writes for snappy typing in autosave panels.
 */
const DebouncedInput = forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ value, onValueCommit, ...props }, ref) => {
    const [local, setLocal] = useState(value)

    // Sync when external value changes (e.g. PING→POST sync)
    useEffect(() => { setLocal(value) }, [value])

    return (
      <Input
        ref={ref}
        {...props}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onValueCommit(local)
        }}
      />
    )
  },
)
DebouncedInput.displayName = 'DebouncedInput'

export { DebouncedInput }
