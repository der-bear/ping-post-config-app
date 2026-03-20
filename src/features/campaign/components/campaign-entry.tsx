import { useState } from 'react'
import { LayoutPanelTop, Rows3 } from 'lucide-react'

import { useCampaignStore } from '../store'
import { CenteredListGroup } from '@/components/centered-list-group'
import { CampaignEditor } from './index'
import { CreateCampaignWizard, type WizardData } from './create-campaign-wizard'
import type { Channel, PricingModel, CampaignStatus } from '../types'

export function CampaignEntry() {
  const resetStore = useCampaignStore((s) => s.resetStore)
  const updateGeneral = useCampaignStore((s) => s.updateGeneral)
  const updateDeliveryOptions = useCampaignStore((s) => s.updateDeliveryOptions)
  const updateQuantityLimits = useCampaignStore((s) => s.updateQuantityLimits)
  const updateLeadValidation = useCampaignStore((s) => s.updateLeadValidation)
  const isPanelExpanded = useCampaignStore((s) => s.isPanelExpanded)
  const [activeView, setActiveView] = useState<'launcher' | 'modal' | 'editor'>('launcher')

  const handleBeforeCreate = (raw: Record<string, unknown>) => {
    const data = raw as unknown as WizardData
    resetStore()

    updateGeneral({
      name: data.name,
      channel: data.channel as Channel,
      leadType: data.leadType,
      pricingModel: data.pricingModel as PricingModel,
      pricePerLead: data.pricePerLead,
      pricePerSale: data.pricePerSale,
      revenueSharePct: data.revenueSharePct,
      status: data.status as CampaignStatus,
    })

    updateDeliveryOptions({
      deliveryMode: data.deliveryMode as 'single' | 'multiple' | 'any-qualified',
      targetMode: data.targetMode as 'specific-buyers' | 'delivery-group',
      selectedBuyer: data.targetBuyer,
      selectedGroup: data.targetGroup,
      buyers: data.buyers.map((b) => ({ id: b.id, name: b.label, warning: b.warning })),
      automationMethod: data.automationMethod,
      maxDeliveryCount: data.maxDeliveryCount,
    })

    updateQuantityLimits({
      hourLimit: { enabled: data.hourLimitEnabled, value: data.hourLimitValue },
      dailyLimit: { enabled: data.dailyLimitEnabled, value: data.dailyLimitValue },
      monthlyLimit: { enabled: data.monthlyLimitEnabled, value: data.monthlyLimitValue },
    })

    updateLeadValidation({
      useQualityControl: data.useQualityControl,
      standardizeAddress: data.standardizeAddress,
      appendCityState: data.appendCityState,
      mobileCheck: data.mobileCheck,
      geolocateIp: data.geolocateIp,
    })
  }

  const handleModalCreate = (data: WizardData) => {
    handleBeforeCreate(data)
    setActiveView('editor')
  }

  const handleShowFlyout = () => {
    resetStore()
    setActiveView('editor')
  }

  const handleEditorClose = () => {
    setActiveView('launcher')
  }

  return (
    <>
      {activeView === 'launcher' && (
        <CenteredListGroup
          heading="Campaign Prototype"
          items={[
            {
              id: 'show-modal',
              label: 'Show Modal',
              description: 'Launch the multi-step creation wizard.',
              icon: <Rows3 className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('modal'),
            },
            {
              id: 'show-flyout',
              label: 'Show Flyout',
              description: 'Open the campaign editor directly.',
              icon: <LayoutPanelTop className="h-4 w-4 text-muted-foreground" />,
              onAction: handleShowFlyout,
            },
          ]}
        />
      )}

      {activeView === 'editor' && (
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-8">
          <div
            className="mx-auto min-h-0 w-full flex-1 transition-[max-width] duration-200"
            style={{ maxWidth: isPanelExpanded ? 860 : 600, minWidth: 480 }}
          >
            <CampaignEditor onClose={handleEditorClose} />
          </div>
        </div>
      )}

      {activeView === 'modal' && (
        <CreateCampaignWizard
          open
          onClose={() => setActiveView('launcher')}
          onCreate={handleModalCreate}
        />
      )}
    </>
  )
}
