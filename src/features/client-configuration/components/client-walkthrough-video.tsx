import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useThemeStore } from '@/hooks/use-theme'

export type ClientWalkthrough = 'criteria' | 'order' | 'delivery-method'

interface ClientWalkthroughVideoProps {
  walkthrough: ClientWalkthrough
  title: string
}

/** Silent, theme-aware walkthrough used by the client-creation handoff. */
export function ClientWalkthroughVideo({
  walkthrough,
  title,
}: ClientWalkthroughVideoProps) {
  const baseUrl = import.meta.env.BASE_URL
  const theme = useThemeStore((state) => state.resolvedTheme)
  const prefersReducedMotion = useReducedMotion()
  const assetName = `${walkthrough}-${theme}`

  return (
    <video
      key={assetName}
      data-walkthrough={walkthrough}
      aria-label={title}
      className="aspect-video w-full bg-muted object-cover"
      autoPlay={!prefersReducedMotion}
      muted
      loop
      playsInline
      preload="metadata"
    >
      <source
        src={`${baseUrl}assets/client-walkthrough-${assetName}.webm`}
        type="video/webm"
      />
    </video>
  )
}
