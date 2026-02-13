import { DeliveryMethodEditor } from '@/features/delivery-method'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { useThemeStore } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

function App() {
  const { resolvedTheme, setTheme } = useThemeStore()
  const isPanelExpanded = useDeliveryMethodStore((s) => s.isPanelExpanded)

  return (
    <div className="h-screen flex flex-col bg-background p-4 md:p-8">
      {/* Theme toggle */}
      <div className="flex justify-end mb-4 shrink-0">
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

      {/* Main editor */}
      <div
        className="mx-auto w-full flex-1 min-h-0 transition-[max-width] duration-200"
        style={{ maxWidth: isPanelExpanded ? 800 : 600, minWidth: 400 }}
      >
        <DeliveryMethodEditor />
      </div>
    </div>
  )
}

export default App
