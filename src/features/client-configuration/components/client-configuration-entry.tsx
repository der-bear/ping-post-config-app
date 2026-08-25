import { useState } from 'react'
import { ClipboardList, ListChecks, Settings2, SquarePlus, Waypoints, Webhook } from 'lucide-react'

import { CenteredListGroup } from '@/components/centered-list-group'
import { CreateDeliveryMethodModal } from '@/features/delivery-method/components/create-delivery-method-modal'
import { DeliveryMethodEditor } from '@/features/delivery-method/components'
import { initializeDeliveryMethod } from '@/features/delivery-method/initialize-delivery-method'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { useClientConfigurationStore } from '../store'
import type { DeliveryAccountSection, OrderSection } from '../types'
import { ClientNextStepsDialog } from './client-next-steps-dialog'
import { CreateClientWizard } from './create-client-wizard'
import { DeliveryAccountEditor } from './delivery-account/delivery-account-editor'
import { CreateOrderDialog } from './order/create-order-dialog'
import { OrderEditor } from './order/order-editor'

type ClientConfigurationView =
  | 'launcher'
  | 'create-client'
  | 'next-steps'
  | 'delivery-account'
  | 'create-order'
  | 'order'
  | 'create-delivery-method'
  | 'delivery-method'

const viewHeadings: Record<Exclude<ClientConfigurationView, 'launcher'>, string> = {
  'create-client': 'Create a Client',
  'next-steps': 'Client Next Steps',
  'delivery-account': 'Delivery Account',
  'create-order': 'Create Order',
  order: 'Order',
  'create-delivery-method': 'Create Delivery Method',
  'delivery-method': 'Delivery Method',
}

export function ClientConfigurationEntry() {
  const replaceFromWizard = useClientConfigurationStore((state) => state.replaceFromWizard)
  const deliveryAccountName = useClientConfigurationStore((state) => state.config.deliveryAccount.name)
  const defaultLeadPrice = useClientConfigurationStore(
    (state) => state.config.deliveryAccount.defaultLeadPrice,
  )
  const replaceOrder = useClientConfigurationStore((state) => state.replaceOrder)
  const isPanelExpanded = useClientConfigurationStore((state) => state.isPanelExpanded)
  const isDeliveryMethodPanelExpanded = useDeliveryMethodStore((state) => state.isPanelExpanded)
  const setActiveDeliveryAccountSection = useClientConfigurationStore(
    (state) => state.setActiveDeliveryAccountSection,
  )
  const setActiveOrderSection = useClientConfigurationStore((state) => state.setActiveOrderSection)
  const [activeView, setActiveView] = useState<ClientConfigurationView>('launcher')
  const [deliveryAccountInitialSection, setDeliveryAccountInitialSection] =
    useState<DeliveryAccountSection>('general')
  const [orderInitialSection, setOrderInitialSection] = useState<OrderSection>('general')
  const [deliveryMethodReturnView, setDeliveryMethodReturnView] =
    useState<'launcher' | 'next-steps'>('launcher')

  const openDeliveryAccount = (section: DeliveryAccountSection) => {
    setDeliveryAccountInitialSection(section)
    setActiveDeliveryAccountSection(section)
    setActiveView('delivery-account')
  }

  const openOrder = (section: OrderSection) => {
    setOrderInitialSection(section)
    setActiveOrderSection(section)
    setActiveView('order')
  }

  const openCreateDeliveryMethod = (returnView: 'launcher' | 'next-steps') => {
    setDeliveryMethodReturnView(returnView)
    setActiveView('create-delivery-method')
  }

  if (activeView === 'create-client') {
    return (
      <CreateClientWizard
        open
        onClose={() => setActiveView('launcher')}
        onCreate={(submission) => {
          replaceFromWizard(submission)
          setActiveView('next-steps')
        }}
      />
    )
  }

  if (activeView === 'next-steps') {
    return (
      <ClientNextStepsDialog
        deliveryAccountName={deliveryAccountName}
        onCreateOrder={() => setActiveView('create-order')}
        onOpenCriteria={() => openDeliveryAccount('criteria')}
        onCreateDeliveryMethod={() => openCreateDeliveryMethod('next-steps')}
        onClose={() => setActiveView('launcher')}
      />
    )
  }

  if (activeView === 'delivery-account') {
    return (
      <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
        <div
          className="h-full min-h-0 w-full transition-[max-width] duration-200"
          style={{ maxWidth: isPanelExpanded ? 1180 : 860, minWidth: 480 }}
        >
          <DeliveryAccountEditor
            initialSection={deliveryAccountInitialSection}
            onClose={() => setActiveView('launcher')}
          />
        </div>
      </div>
    )
  }

  if (activeView === 'create-order') {
    return (
      <CreateOrderDialog
        open
        deliveryAccountName={deliveryAccountName}
        defaultLeadPrice={defaultLeadPrice}
        onClose={() => setActiveView('launcher')}
        onCreate={(submission) => {
          replaceOrder(submission)
          openOrder('general')
        }}
      />
    )
  }

  if (activeView === 'order') {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-8">
        <div
          className="mx-auto min-h-0 w-full flex-1 transition-[max-width] duration-200"
          style={{ maxWidth: isPanelExpanded ? 1180 : 860, minWidth: 480 }}
        >
          <OrderEditor
            initialSection={orderInitialSection}
            onClose={() => setActiveView('launcher')}
          />
        </div>
      </div>
    )
  }

  if (activeView === 'create-delivery-method') {
    return (
      <CreateDeliveryMethodModal
        open
        onClose={() => setActiveView(deliveryMethodReturnView)}
        onCreate={(submission) => {
          initializeDeliveryMethod(submission)
          setActiveView('delivery-method')
        }}
      />
    )
  }

  if (activeView === 'delivery-method') {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-4 md:p-8">
        <div
          className="mx-auto min-h-0 w-full flex-1 transition-[max-width] duration-200"
          style={{ maxWidth: isDeliveryMethodPanelExpanded ? 1180 : 860, minWidth: 480 }}
        >
          <DeliveryMethodEditor onClose={() => setActiveView('launcher')} />
        </div>
      </div>
    )
  }

  if (activeView !== 'launcher') {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold">{viewHeadings[activeView]}</h1>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setActiveView('launcher')}
          >
            Back to Client Configuration
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto py-8">
      <div className="my-auto w-full space-y-8">
        <CenteredListGroup
          heading="Creation flows"
          layout="cards"
          columns={3}
          className="flex-none"
          items={[
            {
              id: 'create-client',
              label: 'Create client and delivery account',
              description: 'Create an outbound client, choose its delivery method, and configure the first account.',
              icon: <SquarePlus className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('create-client'),
            },
            {
              id: 'create-order',
              label: 'Create order',
              description: 'Build the first safe, on-hold lead order for the current client.',
              icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('create-order'),
            },
            {
              id: 'create-delivery-method',
              label: 'Create HTTP Webhook',
              description: 'Create an additional delivery method and configure its endpoint, authentication, and field mappings.',
              icon: <Webhook className="h-4 w-4 text-muted-foreground" />,
              onAction: () => openCreateDeliveryMethod('launcher'),
            },
          ]}
        />

        <CenteredListGroup
          heading="Edit outbound settings"
          layout="cards"
          columns={2}
          className="flex-none"
          items={[
            {
              id: 'delivery-account',
              label: 'Delivery Account',
              description: 'Open General and every captured outbound delivery account configuration panel.',
              icon: <Waypoints className="h-4 w-4 text-muted-foreground" />,
              onAction: () => openDeliveryAccount('general'),
            },
            {
              id: 'order',
              label: 'Order',
              description: 'Edit order settings and manage the delivery account items included in it.',
              icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
              onAction: () => openOrder('general'),
            },
          ]}
        />

        <CenteredListGroup
          heading="Preview next-step dialogs"
          layout="cards"
          columns={2}
          actionLabel="Preview"
          className="flex-none"
          items={[
            {
              id: 'client-next-steps',
              label: 'Client next steps',
              description: 'Preview the recommended outbound setup actions shown after client creation.',
              icon: <Settings2 className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('next-steps'),
            },
          ]}
        />
      </div>
    </div>
  )
}
