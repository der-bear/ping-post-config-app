import { useState, useEffect, useRef, useCallback } from 'react'

export function useUnsavedChanges<T>(config: T) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialRef = useRef<string | null>(null)

  useEffect(() => {
    const snap = JSON.stringify(config)
    if (initialRef.current === null) {
      initialRef.current = snap
      return
    }
    setHasUnsavedChanges(snap !== initialRef.current)
  }, [config])

  const markSaved = useCallback(() => {
    initialRef.current = JSON.stringify(config)
    setHasUnsavedChanges(false)
  }, [config])

  return { hasUnsavedChanges, markSaved }
}
