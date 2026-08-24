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
    }),
    {
      name: 'client-configuration-v1',
      version: 1,
    },
  ),
)
