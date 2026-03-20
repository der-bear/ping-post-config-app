export const FEATURES = [
  {
    id: 'ping-post',
    path: '/ping-post-config-app',
    title: 'Ping/Post Config',
    description: 'Open the delivery method prototype and its create flow.',
  },
  {
    id: 'campaign',
    path: '/campaign-configuration',
    title: 'Campaign Config',
    description: 'Compare the campaign modal and flyout-style editor.',
  },
] as const

export type FeatureId = (typeof FEATURES)[number]['id']
export type AppRouteId = FeatureId | 'home'

export function getRouteFromPath(): AppRouteId {
  const path = window.location.pathname
  const match = FEATURES.find((f) => path.includes(f.path.slice(1)))
  return match?.id ?? 'home'
}
