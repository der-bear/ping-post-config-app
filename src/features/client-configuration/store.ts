import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { configurationFromWizard, createDemoClientConfiguration } from './data/demo-data'
import type {
  ClientConfiguration,
  ClientWizardSubmission,
  DeliveryAccountSection,
  OrderSection,
} from './types'

interface ClientConfigurationStore {
  config: ClientConfiguration
  activeDeliveryAccountSection: DeliveryAccountSection
  activeOrderSection: OrderSection
  isPanelExpanded: boolean
  resetDemo: () => void
  replaceFromWizard: (submission: ClientWizardSubmission) => void
  setActiveDeliveryAccountSection: (section: DeliveryAccountSection) => void
  setActiveOrderSection: (section: OrderSection) => void
  togglePanelExpanded: () => void
  updateDeliveryAccount: (partial: Partial<ClientConfiguration['deliveryAccount']>) => void
  updateQuantityLimits: (
    partial: Partial<ClientConfiguration['deliveryAccount']['quantityLimits']>,
  ) => void
  updateDeliverySettings: (
    partial: Partial<ClientConfiguration['deliveryAccount']['delivery']>,
  ) => void
  updateRevenue: (partial: Partial<ClientConfiguration['deliveryAccount']['revenue']>) => void
  updateOffer: (partial: Partial<ClientConfiguration['deliveryAccount']['offer']>) => void
  updateAdvanced: (partial: Partial<ClientConfiguration['deliveryAccount']['advanced']>) => void
}

export const useClientConfigurationStore = create<ClientConfigurationStore>()(
  persist(
    (set) => ({
      config: createDemoClientConfiguration(),
      activeDeliveryAccountSection: 'general',
      activeOrderSection: 'general',
      isPanelExpanded: false,
      resetDemo: () =>
        set({
          config: createDemoClientConfiguration(),
          activeDeliveryAccountSection: 'general',
          activeOrderSection: 'general',
        }),
      replaceFromWizard: (submission) =>
        set({
          config: configurationFromWizard(submission),
          activeDeliveryAccountSection: 'general',
          activeOrderSection: 'general',
        }),
      setActiveDeliveryAccountSection: (section) =>
        set({ activeDeliveryAccountSection: section }),
      setActiveOrderSection: (section) => set({ activeOrderSection: section }),
      togglePanelExpanded: () =>
        set((state) => ({ isPanelExpanded: !state.isPanelExpanded })),
      updateDeliveryAccount: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              ...partial,
              criteria: state.config.deliveryAccount.criteria,
            },
          },
        })),
      updateQuantityLimits: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              quantityLimits: {
                ...state.config.deliveryAccount.quantityLimits,
                ...partial,
              },
            },
          },
        })),
      updateDeliverySettings: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              delivery: { ...state.config.deliveryAccount.delivery, ...partial },
            },
          },
        })),
      updateRevenue: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              revenue: { ...state.config.deliveryAccount.revenue, ...partial },
            },
          },
        })),
      updateOffer: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              offer: { ...state.config.deliveryAccount.offer, ...partial },
            },
          },
        })),
      updateAdvanced: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              advanced: { ...state.config.deliveryAccount.advanced, ...partial },
            },
          },
        })),
    }),
    {
      name: 'client-configuration-v1',
      version: 1,
    },
  ),
)
