import { useState, useEffect } from 'react'

import { DeliveryMethodEntry } from '@/features/delivery-method/components/delivery-method-entry'
import { CampaignEntry } from '@/features/campaign/components/campaign-entry'
import { Toaster } from '@/components/ui/toaster'
import { getRouteFromPath, type AppRouteId } from '@/config/routes'

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>(getRouteFromPath)

  useEffect(() => {
    const onPopState = () => setActiveRoute(getRouteFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {activeRoute === 'ping-post' && <DeliveryMethodEntry />}
      {activeRoute === 'campaign' && <CampaignEntry />}
      <Toaster />
    </div>
  )
}

export default App
