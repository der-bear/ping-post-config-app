import { useState, useEffect } from 'react'
import { Boxes, Megaphone, ChevronRight } from 'lucide-react'

import { DeliveryMethodEntry } from '@/features/delivery-method/components/delivery-method-entry'
import { CampaignEntry } from '@/features/campaign/components/campaign-entry'
import { Toaster } from '@/components/ui/toaster'
import { FEATURES, getRouteFromPath, type AppRouteId } from '@/config/routes'

const ICONS: Record<string, React.ReactNode> = {
  'ping-post': <Boxes className="h-4 w-4 text-muted-foreground" />,
  campaign: <Megaphone className="h-4 w-4 text-muted-foreground" />,
}

function Home() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-sm text-muted-foreground px-1">Prototypes</h1>
        {FEATURES.map((f) => (
          <a
            key={f.id}
            href={f.path}
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-accent"
          >
            {ICONS[f.id]}
            <span className="flex-1 font-medium">{f.title}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        ))}
      </div>
    </main>
  )
}

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>(getRouteFromPath)

  useEffect(() => {
    const onPopState = () => setActiveRoute(getRouteFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {activeRoute === 'home' && <Home />}
      {activeRoute === 'ping-post' && <DeliveryMethodEntry />}
      {activeRoute === 'campaign' && <CampaignEntry />}
      <Toaster />
    </div>
  )
}

export default App
