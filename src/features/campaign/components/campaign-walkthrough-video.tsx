import type { Channel } from '../types'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useThemeStore } from '@/hooks/use-theme'

interface CampaignWalkthroughVideoProps {
  channel: Channel
  title: string
}

/** Channel-specific, silent walkthrough used by the lead-source completion handoff. */
export function CampaignWalkthroughVideo({
  channel,
  title,
}: CampaignWalkthroughVideoProps) {
  const baseUrl = import.meta.env.BASE_URL
  const theme = useThemeStore((state) => state.resolvedTheme)
  const prefersReducedMotion = useReducedMotion()
  const assetName = `${channel}-${theme}`

  return (
    <video
      data-channel={channel}
      aria-label={title}
      className="aspect-video w-full bg-muted object-cover"
      poster={`${baseUrl}assets/campaign-preview-${assetName}.png?v=first-frame-20260825`}
      autoPlay={!prefersReducedMotion}
      muted
      loop
      playsInline
      preload="metadata"
    >
      <source
        src={`${baseUrl}assets/campaign-walkthrough-${assetName}.webm`}
        type="video/webm"
      />
      <source
        src={`${baseUrl}assets/campaign-walkthrough-${assetName}.mp4`}
        type="video/mp4"
      />
    </video>
  )
}
