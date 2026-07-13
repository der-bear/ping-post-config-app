import { useState } from 'react'
import { LayoutPanelTop, Rows3, SquarePlus } from 'lucide-react'

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
  const [activeView, setActiveView] = useState<'launcher' | 'modal' | 'lead-source-modal' | 'editor'>('launcher')

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
      scanCoverageEnabled: data.scanCoverageEnabled,
      scanCoverage: data.scanCoverage,
      standardizeAddress: data.standardizeAddress,
      appendCityState: data.appendCityState,
      mobileCheck: data.mobileCheck,
      geolocateIp: data.geolocateIp,
    })
  }

  const handleModalCreate = (data: WizardData) => {
    if (data.createFirstCampaign !== false) handleBeforeCreate(data)
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
          heading="Campaign routing setup"
          layout="cards"
          items={[
            {
              id: 'create-lead-source',
              label: 'Create lead source and campaign',
              description: 'Name a new lead source first, then continue through the campaign setup wizard.',
              icon: <SquarePlus className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('lead-source-modal'),
            },
            {
              id: 'create-campaign',
              label: 'Create campaign only',
              description: 'Use the standard campaign wizard when the lead source already exists.',
              icon: <Rows3 className="h-4 w-4 text-muted-foreground" />,
              onAction: () => setActiveView('modal'),
            },
            {
              id: 'open-editor',
              label: 'Open campaign editor',
              description: 'Skip creation and review the campaign configuration panels directly.',
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

      {activeView === 'lead-source-modal' && (
        <CreateCampaignWizard
          open
          mode="lead-source"
          onClose={() => setActiveView('launcher')}
          onCreate={handleModalCreate}
        />
      )}
    </>
  )
}
