import { useState, useEffect } from 'react'

import { DeliveryMethodEntry } from '@/features/delivery-method/components/delivery-method-entry'
import { CampaignEntry } from '@/features/campaign/components/campaign-entry'
import { Toaster } from '@/components/ui/toaster'
import { ThemeToggle } from '@/components/theme-toggle'
import { getRouteFromPath, type AppRouteId } from '@/config/routes'

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRouteId>(getRouteFromPath)
  const isWalkthroughCapture = new URLSearchParams(window.location.search).has('walkthrough-capture')
  const [isCaptureScaled, setIsCaptureScaled] = useState(false)

  useEffect(() => {
    const onPopState = () => setActiveRoute(getRouteFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!isWalkthroughCapture) return

    const toggleCaptureScale = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'c') {
        setIsCaptureScaled((current) => !current)
      }
    }

    window.addEventListener('keydown', toggleCaptureScale)
    return () => window.removeEventListener('keydown', toggleCaptureScale)
  }, [isWalkthroughCapture])

  return (
    <div
      className="h-screen flex flex-col bg-background"
      data-walkthrough-capture={isWalkthroughCapture ? '' : undefined}
      data-capture-scale={isCaptureScaled ? '2' : undefined}
    >
      {activeRoute === 'ping-post' && <DeliveryMethodEntry />}
      {activeRoute === 'campaign' && <CampaignEntry />}
      <Toaster />
      <ThemeToggle />
    </div>
  )
}

export default App
