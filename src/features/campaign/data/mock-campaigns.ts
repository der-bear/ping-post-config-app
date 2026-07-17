// Mock data for the create/clone campaign flows. In a real build these come from the
// API; here they back the lead-source dropdown and the clone-source campaign picker.

export interface CloneSourceCampaign {
  id: string
  name: string
  leadSourceId: string
}

export const LEAD_SOURCE_OPTIONS = [
  { value: 'acme-web-leads', label: 'Acme Web Leads' },
  { value: 'mortgage-partner-network', label: 'Mortgage Partner Network' },
  { value: 'contact-us-form', label: 'Contact Us Form' },
]

export const CLONE_SOURCE_CAMPAIGNS: CloneSourceCampaign[] = [
  { id: '30367', name: 'Acme Mortgage Q1', leadSourceId: 'acme-web-leads' },
  { id: '30530', name: 'Acme Refi Push', leadSourceId: 'acme-web-leads' },
  { id: '30366', name: 'Partner Network Auto', leadSourceId: 'mortgage-partner-network' },
  { id: '30368', name: 'Partner Home Insurance', leadSourceId: 'mortgage-partner-network' },
  { id: '30555', name: 'Contact Us General', leadSourceId: 'contact-us-form' },
]

/** Campaigns for the picker, filtered by lead source ('all' = no filter). */
export function cloneCampaignsFor(leadSourceFilter: string): CloneSourceCampaign[] {
  return leadSourceFilter === 'all'
    ? CLONE_SOURCE_CAMPAIGNS
    : CLONE_SOURCE_CAMPAIGNS.filter((c) => c.leadSourceId === leadSourceFilter)
}

export function findCloneCampaign(id: string): CloneSourceCampaign | undefined {
  return CLONE_SOURCE_CAMPAIGNS.find((c) => c.id === id)
}
