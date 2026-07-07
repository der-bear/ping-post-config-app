import { create } from 'zustand'
import type {
  ActivePanel,
  Buyer,
  CampaignConfig,
} from './types'

// ---- Default Config ----

const defaultConfig: CampaignConfig = {
  general: {
    name: '',
    channel: 'web',
    leadType: 'mortgage',
    pricingModel: 'per-lead',
    pricePerLead: '$10.00',
    pricePerSale: '$0.00',
    revenueSharePct: '0.00%',
    status: 'active',
  },
  deliveryOptions: {
    deliveryMode: 'any-qualified',
    targetMode: 'specific-buyers',
    selectedBuyer: '',
    selectedGroup: '',
    buyers: [],
    automationMethod: 'system-default',
    maxDeliveryCount: '3',
  },
  duplicateChecks: {
    leadType: 'mortgage',
    checkRejectedLeads: false,
    duplicateDays: '30',
    appendDuplicateData: false,
    allowPingDuplicateCheck: false,
    resendDeliveries: false,
  },
  criteria: [],
  quantityLimits: {
    hourLimit: { enabled: false, value: '0' },
    dailyLimit: { enabled: false, value: '0' },
    monthlyLimit: { enabled: false, value: '0' },
  },
  leadValidation: {
    useQualityControl: false,
    defaultRejectAction: 'reject-to-source',
    scanCoverage: 'reject-no-coverage',
    standardizeAddress: false,
    appendCityState: false,
    mobileCheck: false,
    geolocateIp: false,
    enableLeadGrading: false,
    gradingConfigMode: 'lead-source',
  },
  compliance: {
    enableTcpa: false,
    returnClientOffers: false,
    retentionPolicyDays: '0',
    rejectedRetentionDays: '0',
  },
  integrations: {
    added: [
      { id: 'pure-caller-id', name: 'Pure Caller ID', subtitle: 'Single Lead Load', icon: '📱', iconBg: '#ffffff' },
      { id: 'dnc', name: 'DNC', subtitle: '1 Litigator Scrub', icon: '🌙', iconBg: '#ffffff' },
      { id: 'trestle-real-contact', name: 'Trestle', subtitle: 'Real Contact', icon: '🌿', iconBg: '#ffffff' },
    ],
    available: [
      { id: 'briteverify', name: 'BriteVerify', subtitle: 'Email Verification', icon: '✅', iconBg: '#ffffff' },
      { id: 'twilio', name: 'Twilio', subtitle: 'SMS & Voice', icon: '📞', iconBg: '#ffffff' },
      { id: 'jornaya', name: 'Jornaya', subtitle: 'TCPA Compliance', icon: '🔵', iconBg: '#ffffff' },
      { id: 'trustedform', name: 'TrustedForm', subtitle: 'Consent Certificate', icon: '🟢', iconBg: '#ffffff' },
      { id: 'ipqs', name: 'IPQS', subtitle: 'Fraud Detection', icon: '🔥', iconBg: '#ffffff' },
      { id: 'searchbug', name: 'Searchbug', subtitle: 'Data Enrichment', icon: '🐛', iconBg: '#ffffff' },
    ],
  },
  integrationCriteria: [],
  agentForms: [],
}

// ---- Store Interface ----

export interface CampaignStore {
  // State
  config: CampaignConfig
  activePanel: ActivePanel
  isQualityControlExpanded: boolean
  isIntegrationsExpanded: boolean
  isPostbackExpanded: boolean
  isPanelExpanded: boolean

  // Navigation
  setActivePanel: (panel: ActivePanel) => void
  toggleQualityControlExpanded: () => void
  toggleIntegrationsExpanded: () => void
  togglePostbackExpanded: () => void
  togglePanelExpanded: () => void

  // General
  updateGeneral: (partial: Partial<CampaignConfig['general']>) => void

  // Delivery Options
  updateDeliveryOptions: (partial: Partial<CampaignConfig['deliveryOptions']>) => void
  addBuyer: (buyer: Buyer) => void
  removeBuyer: (id: string) => void

  // Duplicate Checks
  updateDuplicateChecks: (partial: Partial<CampaignConfig['duplicateChecks']>) => void

  // Quantity Limits
  updateQuantityLimits: (partial: Partial<CampaignConfig['quantityLimits']>) => void

  // Lead Validation
  updateLeadValidation: (partial: Partial<CampaignConfig['leadValidation']>) => void

  // Compliance
  updateCompliance: (partial: Partial<CampaignConfig['compliance']>) => void

  // Integrations
  addIntegration: (id: string) => void
  removeIntegration: (id: string) => void
  reorderAddedIntegrations: (fromId: string, toId: string) => void

  // Reset
  resetStore: () => void
}

// ---- Store ----

export const useCampaignStore = create<CampaignStore>()((set) => ({
  // ---- State ----
  config: defaultConfig,
  activePanel: { section: 'general' } as ActivePanel,
  isQualityControlExpanded: true,
  isIntegrationsExpanded: true,
  isPostbackExpanded: true,
  isPanelExpanded: true,

  // ---- Navigation ----
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleQualityControlExpanded: () =>
    set((s) => ({ isQualityControlExpanded: !s.isQualityControlExpanded })),
  toggleIntegrationsExpanded: () =>
    set((s) => ({ isIntegrationsExpanded: !s.isIntegrationsExpanded })),
  togglePostbackExpanded: () =>
    set((s) => ({ isPostbackExpanded: !s.isPostbackExpanded })),
  togglePanelExpanded: () =>
    set((s) => ({ isPanelExpanded: !s.isPanelExpanded })),

  // ---- General ----
  updateGeneral: (partial) =>
    set((s) => ({
      config: { ...s.config, general: { ...s.config.general, ...partial } },
    })),

  // ---- Delivery Options ----
  updateDeliveryOptions: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        deliveryOptions: { ...s.config.deliveryOptions, ...partial },
      },
    })),

  addBuyer: (buyer) =>
    set((s) => ({
      config: {
        ...s.config,
        deliveryOptions: {
          ...s.config.deliveryOptions,
          buyers: [...s.config.deliveryOptions.buyers, buyer],
        },
      },
    })),

  removeBuyer: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        deliveryOptions: {
          ...s.config.deliveryOptions,
          buyers: s.config.deliveryOptions.buyers.filter((b) => b.id !== id),
        },
      },
    })),

  // ---- Duplicate Checks ----
  updateDuplicateChecks: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        duplicateChecks: { ...s.config.duplicateChecks, ...partial },
      },
    })),

  // ---- Quantity Limits ----
  updateQuantityLimits: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        quantityLimits: { ...s.config.quantityLimits, ...partial },
      },
    })),

  // ---- Lead Validation ----
  updateLeadValidation: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        leadValidation: { ...s.config.leadValidation, ...partial },
      },
    })),

  // ---- Compliance ----
  updateCompliance: (partial) =>
    set((s) => ({
      config: {
        ...s.config,
        compliance: { ...s.config.compliance, ...partial },
      },
    })),

  // ---- Integrations ----
  addIntegration: (id) =>
    set((s) => {
      const item = s.config.integrations.available.find((i) => i.id === id)
      if (!item) return s
      return {
        config: {
          ...s.config,
          integrations: {
            added: [...s.config.integrations.added, item],
            available: s.config.integrations.available.filter((i) => i.id !== id),
          },
        },
      }
    }),

  removeIntegration: (id) =>
    set((s) => {
      const item = s.config.integrations.added.find((i) => i.id === id)
      if (!item) return s
      return {
        config: {
          ...s.config,
          integrations: {
            added: s.config.integrations.added.filter((i) => i.id !== id),
            available: [...s.config.integrations.available, item],
          },
        },
      }
    }),

  reorderAddedIntegrations: (fromId, toId) =>
    set((s) => {
      const list = s.config.integrations.added
      const fromIdx = list.findIndex((i) => i.id === fromId)
      const toIdx = list.findIndex((i) => i.id === toId)
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return s
      const next = [...list]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return {
        config: {
          ...s.config,
          integrations: { ...s.config.integrations, added: next },
        },
      }
    }),

  // ---- Reset ----
  resetStore: () =>
    set({
      config: defaultConfig,
      activePanel: { section: 'general' },
      isQualityControlExpanded: true,
      isIntegrationsExpanded: true,
      isPostbackExpanded: true,
      isPanelExpanded: true,
    }),
}))
