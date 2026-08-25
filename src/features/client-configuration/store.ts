import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { configurationFromWizard, createDemoClientConfiguration } from './data/demo-data'
import type {
  ClientConfiguration,
  ClientWizardSubmission,
  CriteriaRule,
  DeliveryAccountSection,
  OrderCreationSubmission,
  OrderItem,
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
  addCriterion: (rule: CriteriaRule) => void
  updateCriterion: (id: string, partial: Partial<Omit<CriteriaRule, 'id'>>) => void
  removeCriteria: (ids: string[]) => void
  replaceOrder: (submission: OrderCreationSubmission) => void
  updateOrder: (partial: Partial<Omit<ClientConfiguration['order'], 'items'>>) => void
  addOrderItem: (item: OrderItem) => void
  updateOrderItem: (id: string, partial: Partial<Omit<OrderItem, 'id'>>) => void
  removeOrderItems: (ids: string[]) => void
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
      addCriterion: (rule) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              criteria: [...state.config.deliveryAccount.criteria, rule],
            },
          },
        })),
      updateCriterion: (id, partial) =>
        set((state) => ({
          config: {
            ...state.config,
            deliveryAccount: {
              ...state.config.deliveryAccount,
              criteria: state.config.deliveryAccount.criteria.map((criterion) =>
                criterion.id === id ? { ...criterion, ...partial } : criterion,
              ),
            },
          },
        })),
      removeCriteria: (ids) =>
        set((state) => {
          const removedIds = new Set(ids)
          return {
            config: {
              ...state.config,
              deliveryAccount: {
                ...state.config.deliveryAccount,
                criteria: state.config.deliveryAccount.criteria.filter(
                  (criterion) => !removedIds.has(criterion.id),
                ),
              },
            },
          }
        }),
      replaceOrder: (submission) =>
        set((state) => ({
          config: {
            ...state.config,
            order: {
              name: submission.name,
              leadType: submission.leadType,
              description: submission.description,
              status: submission.status,
              startDate: submission.startDate,
              endDate: submission.endDate,
              renewOrder: submission.renewOrder,
              autoCharge: submission.autoCharge,
              autoChargeTiming: 'Charge before order starts',
              paymentDiscount: submission.paymentDiscount,
              maxReturnPercentageEnabled: false,
              maxReturnPercentage: submission.maxReturnPercentage,
              items: [
                {
                  id: `order-item-${Date.now()}`,
                  deliveryAccount: submission.deliveryAccount,
                  orderType: submission.orderType,
                  quantity: submission.quantity,
                  perLeadPrice: submission.perLeadPrice,
                  sent: 0,
                },
              ],
            },
          },
          activeOrderSection: 'general',
        })),
      updateOrder: (partial) =>
        set((state) => ({
          config: {
            ...state.config,
            order: { ...state.config.order, ...partial, items: state.config.order.items },
          },
        })),
      addOrderItem: (item) =>
        set((state) => ({
          config: {
            ...state.config,
            order: { ...state.config.order, items: [...state.config.order.items, item] },
          },
        })),
      updateOrderItem: (id, partial) =>
        set((state) => ({
          config: {
            ...state.config,
            order: {
              ...state.config.order,
              items: state.config.order.items.map((item) =>
                item.id === id ? { ...item, ...partial } : item,
              ),
            },
          },
        })),
      removeOrderItems: (ids) =>
        set((state) => {
          const removedIds = new Set(ids)
          return {
            config: {
              ...state.config,
              order: {
                ...state.config.order,
                items: state.config.order.items.filter((item) => !removedIds.has(item.id)),
              },
            },
          }
        }),
    }),
    {
      name: 'client-configuration-v5',
      version: 5,
    },
  ),
)
