import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/hooks/use-theme'

/** Global binary light/dark theme control for the prototype. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      data-slot="theme-toggle"
      className="fixed bottom-6 right-6 z-40 size-11 rounded-full shadow-md"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
