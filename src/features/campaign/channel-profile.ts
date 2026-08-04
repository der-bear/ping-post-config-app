import type { CampaignSection, Channel } from './types'

export interface CampaignChannelProfile {
  subtitle: string
  specialSection: { section: CampaignSection; label: string } | null
  qualitySections: CampaignSection[]
  showAgentForms: boolean
  completionTarget: CampaignSection
}

const FULL_QUALITY_SECTIONS: CampaignSection[] = [
  'duplicate-checks',
  'criteria',
  'quantity-limits',
  'lead-validation',
  'compliance',
]

const CHANNEL_PROFILES: Record<Channel, CampaignChannelProfile> = {
  web: {
    subtitle: 'Campaign - Web',
    specialSection: null,
    qualitySections: FULL_QUALITY_SECTIONS,
    showAgentForms: true,
    completionTarget: 'general',
  },
  'ping-post': {
    subtitle: 'Campaign - PING/POST',
    specialSection: { section: 'ping-options', label: 'PING Options' },
    qualitySections: FULL_QUALITY_SECTIONS,
    showAgentForms: false,
    completionTarget: 'ping-options',
  },
  phone: {
    subtitle: 'Campaign - Phone',
    specialSection: { section: 'phone-numbers', label: 'Phone Numbers' },
    qualitySections: ['compliance'],
    showAgentForms: false,
    completionTarget: 'phone-numbers',
  },
  chat: {
    subtitle: 'Campaign - Chat',
    specialSection: { section: 'web-chats', label: 'Web Chats' },
    qualitySections: ['compliance'],
    showAgentForms: false,
    completionTarget: 'web-chats',
  },
}

export function getCampaignChannelProfile(channel: Channel): CampaignChannelProfile {
  return CHANNEL_PROFILES[channel]
}

export function isSectionAvailableForChannel(
  section: CampaignSection,
  profile: CampaignChannelProfile,
): boolean {
  return section === 'general'
    || section === 'delivery-options'
    || section === profile.specialSection?.section
    || profile.qualitySections.includes(section)
    || section === 'integrations-manage'
    || section === 'integration-criteria'
    || section === 'postback-configuration'
    || section === 'postback-history'
    || (profile.showAgentForms && section === 'agent-forms')
}
