import { useState } from 'react'
import { ClipboardList, ListChecks, Settings2, SquarePlus, Waypoints } from 'lucide-react'

import { CenteredListGroup } from '@/components/centered-list-group'

type ClientConfigurationView =
  | 'launcher'
  | 'create-client'
  | 'next-steps'
  | 'delivery-account'
  | 'create-order'
  | 'order'

const viewHeadings: Record<Exclude<ClientConfigurationView, 'launcher'>, string> = {
  'create-client': 'Create a Client',
  'next-steps': 'Client Next Steps',
  'delivery-account': 'Delivery Account',
  'create-order': 'Create Order',
  order: 'Order',
}

export function ClientConfigurationEntry() {
  const [activeView, setActiveView] = useState<ClientConfigurationView>('launcher')

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
          columns={2}
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
              onAction: () => setActiveView('delivery-account'),
            },
            {
              id: 'order',
              label: 'Order',
              description: 'Edit order settings and manage the delivery account items included in it.',
              icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('order'),
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
