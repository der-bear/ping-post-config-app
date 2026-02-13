import { DeliveryMethodEntry } from '@/features/delivery-method/components/delivery-method-entry'
import { useThemeStore } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { Moon, Sun } from 'lucide-react'

function App() {
  const { resolvedTheme, setTheme } = useThemeStore()

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
        </Button>
      </div>

      {/* Main content */}
      <DeliveryMethodEntry />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default App
