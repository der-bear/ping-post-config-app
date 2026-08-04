import { useState } from 'react'
import { Globe2, MessagesSquare, Phone, RadioTower, Rows3, SquarePlus } from 'lucide-react'

import { useCampaignStore } from '../store'
import { CenteredListGroup } from '@/components/centered-list-group'
import { CampaignEditor } from './index'
import { CreateCampaignWizard, type WizardData } from './create-campaign-wizard'
import { LeadSourceNextStepsDialog } from './lead-source-next-steps-dialog'
import type { Channel, PricingModel, CampaignStatus } from '../types'
import { getCampaignChannelProfile } from '../channel-profile'

const NEXT_STEPS_PREVIEW_CAMPAIGN_NAMES: Record<Channel, string> = {
  web: 'Mortgage Web Form',
  'ping-post': 'Mortgage Ping Post',
  phone: 'Mortgage Phone',
  chat: 'Mortgage Chat Leads',
}

export function CampaignEntry() {
  const resetStore = useCampaignStore((s) => s.resetStore)
  const updateGeneral = useCampaignStore((s) => s.updateGeneral)
  const updateDeliveryOptions = useCampaignStore((s) => s.updateDeliveryOptions)
  const updateQuantityLimits = useCampaignStore((s) => s.updateQuantityLimits)
  const updateLeadValidation = useCampaignStore((s) => s.updateLeadValidation)
  const setActivePanel = useCampaignStore((s) => s.setActivePanel)
  const isPanelExpanded = useCampaignStore((s) => s.isPanelExpanded)
  const [activeView, setActiveView] = useState<
    'launcher' | 'modal' | 'lead-source-modal' | 'lead-source-next-steps' | 'editor'
  >('launcher')
  const [createdCampaignName, setCreatedCampaignName] = useState('')
  const [createdCampaignChannel, setCreatedCampaignChannel] = useState<Channel>('web')

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

  const handleModalCreate = (
    data: WizardData,
    destination: 'editor' | 'lead-source-next-steps',
  ) => {
    if (data.campaignPlan === 'none') {
      // No campaign to open; the lead source is "created" and we return to the launcher.
      setActiveView('launcher')
      return
    }

    if (data.campaignPlan === 'clone') {
      // The config steps are skipped when cloning, so seed the editor from the user's new
      // name. A real clone would copy the full source campaign config here.
      resetStore()
      updateGeneral({
        name: data.cloneCampaignName ?? '',
        status: data.cloneCampaignStatus ?? 'active',
      })
    } else {
      handleBeforeCreate(data)
    }

    setCreatedCampaignName(
      data.campaignPlan === 'clone' ? data.cloneCampaignName ?? '' : data.name,
    )
    setCreatedCampaignChannel(data.channel)
    setActiveView(destination)
  }

  const handleShowEditor = (channel: Channel) => {
    resetStore()
    updateGeneral({ channel })
    setActivePanel({ section: getCampaignChannelProfile(channel).completionTarget })
    setActiveView('editor')
  }

  const handleEditorClose = () => {
    setActiveView('launcher')
  }

  const handleShowNextSteps = (channel: Channel) => {
    const campaignName = NEXT_STEPS_PREVIEW_CAMPAIGN_NAMES[channel]
    resetStore()
    updateGeneral({ channel, name: campaignName })
    setCreatedCampaignName(campaignName)
    setCreatedCampaignChannel(channel)
    setActiveView('lead-source-next-steps')
  }

  const handleNextStepsNext = () => {
    setActivePanel({ section: getCampaignChannelProfile(createdCampaignChannel).completionTarget })
    setActiveView('editor')
  }

  return (
    <>
      {activeView === 'launcher' && (
        <div className="flex min-h-0 flex-1 overflow-y-auto py-8">
          <div className="my-auto w-full space-y-8">
            <CenteredListGroup
              heading="Creation flows"
              layout="cards"
              columns={2}
              className="flex-none"
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
              ]}
            />

            <CenteredListGroup
              heading="Edit campaign settings"
              layout="cards"
              columns={4}
              className="flex-none"
              items={[
                {
                  id: 'open-web-editor',
                  label: 'Web campaign',
                  description: 'Open General Settings and the complete Web campaign navigation.',
                  icon: <Globe2 className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowEditor('web'),
                },
                {
                  id: 'open-ping-post-editor',
                  label: 'Ping/Post campaign',
                  description: 'Open PING Options and configure PING/POST requirements.',
                  icon: <RadioTower className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowEditor('ping-post'),
                },
                {
                  id: 'open-phone-editor',
                  label: 'Phone campaign',
                  description: 'Open Phone Numbers and the IVR setup preview.',
                  icon: <Phone className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowEditor('phone'),
                },
                {
                  id: 'open-chat-editor',
                  label: 'Chat campaign',
                  description: 'Open Web Chats and the chat configuration preview.',
                  icon: <MessagesSquare className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowEditor('chat'),
                },
              ]}
            />

            <CenteredListGroup
              heading="Preview next-step dialogs"
              layout="cards"
              columns={4}
              actionLabel="Preview"
              className="flex-none"
              items={[
                {
                  id: 'preview-web-next-steps',
                  label: 'Web next steps',
                  description: 'Preview the General Settings guidance shown after lead source creation.',
                  icon: <Globe2 className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowNextSteps('web'),
                },
                {
                  id: 'preview-ping-post-next-steps',
                  label: 'Ping/Post next steps',
                  description: 'Preview the PING Options guidance shown after lead source creation.',
                  icon: <RadioTower className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowNextSteps('ping-post'),
                },
                {
                  id: 'preview-phone-next-steps',
                  label: 'Phone next steps',
                  description: 'Preview the Phone Numbers guidance shown after lead source creation.',
                  icon: <Phone className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowNextSteps('phone'),
                },
                {
                  id: 'preview-chat-next-steps',
                  label: 'Chat next steps',
                  description: 'Preview the Web Chats guidance shown after lead source creation.',
                  icon: <MessagesSquare className="h-4 w-4 text-muted-foreground" />,
                  onAction: () => handleShowNextSteps('chat'),
                },
              ]}
            />
          </div>
        </div>
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

      {activeView === 'lead-source-next-steps' && (
        <LeadSourceNextStepsDialog
          campaignName={createdCampaignName}
          channel={createdCampaignChannel}
          onClose={() => setActiveView('launcher')}
          onNext={handleNextStepsNext}
        />
      )}

      {activeView === 'modal' && (
        <CreateCampaignWizard
          open
          onClose={() => setActiveView('launcher')}
          onCreate={(data) => handleModalCreate(data, 'editor')}
        />
      )}

      {activeView === 'lead-source-modal' && (
        <CreateCampaignWizard
          open
          mode="lead-source"
          onClose={() => setActiveView('launcher')}
          onCreate={(data) => handleModalCreate(data, 'lead-source-next-steps')}
        />
      )}
    </>
  )
}
