const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const FEATURES = [
  {
    id: 'ping-post',
    slug: 'ping-post',
    title: 'Ping/Post Config',
    description: 'Open the delivery method prototype and its create flow.',
  },
  {
    id: 'campaign',
    slug: 'campaign-configuration',
    title: 'Campaign Config',
    description: 'Compare the campaign modal and flyout-style editor.',
  },
] as const

export type FeatureId = (typeof FEATURES)[number]['id']
export type AppRouteId = FeatureId | 'home'

export function featurePath(slug: string): string {
  return `${BASE}/${slug}`
}

export function getRouteFromPath(): AppRouteId {
  const path = window.location.pathname
  const match = FEATURES.find((f) => path.includes(f.slug))
  return match?.id ?? 'home'
}
