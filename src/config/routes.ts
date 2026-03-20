const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

export const FEATURES = [
  {
    id: 'ping-post',
    slug: '', // root — serves at the base URL
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
  return slug ? `${BASE}/${slug}` : BASE || '/'
}

export function getRouteFromPath(): AppRouteId {
  const path = window.location.pathname
  // Check non-root features first (campaign, etc.)
  const subFeature = FEATURES.find((f) => f.slug && path.includes(f.slug))
  if (subFeature) return subFeature.id
  // Root URL → ping-post (default)
  return 'ping-post'
}
