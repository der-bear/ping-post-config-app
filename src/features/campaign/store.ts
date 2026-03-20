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
    channel: 'web-leads',
    leadType: 'mortgage',
    pricingModel: 'per-lead',
    pricePerLead: '$10.00',
    pricePerSale: '$0.00',
    revenueSharePct: '0.00%',
    status: 'active',
  },
  deliveryOptions: {
    deliveryMode: 'single',
    targetMode: 'specific-buyers',
    selectedBuyer: '',
    selectedGroup: '',
    buyers: [],
    automationMethod: 'priority',
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
    added: [],
    available: [
      { id: 'purecallerid', name: 'PureCallerIdSSL', icon: '🟩' },
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
  isPanelExpanded: boolean

  // Navigation
  setActivePanel: (panel: ActivePanel) => void
  toggleQualityControlExpanded: () => void
  toggleIntegrationsExpanded: () => void
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

  // Reset
  resetStore: () => void
}

// ---- Store ----

export const useCampaignStore = create<CampaignStore>()((set) => ({
  // ---- State ----
  config: defaultConfig,
  activePanel: { section: 'general' } as ActivePanel,
  isQualityControlExpanded: true,
  isIntegrationsExpanded: false,
  isPanelExpanded: false,

  // ---- Navigation ----
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleQualityControlExpanded: () =>
    set((s) => ({ isQualityControlExpanded: !s.isQualityControlExpanded })),
  toggleIntegrationsExpanded: () =>
    set((s) => ({ isIntegrationsExpanded: !s.isIntegrationsExpanded })),
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

  // ---- Reset ----
  resetStore: () =>
    set({
      config: defaultConfig,
      activePanel: { section: 'general' },
      isQualityControlExpanded: true,
      isIntegrationsExpanded: false,
      isPanelExpanded: false,
    }),
}))
