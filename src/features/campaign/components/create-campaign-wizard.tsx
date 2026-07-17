import { useRef, useState } from 'react'
import { Copy, FilePlus2 } from 'lucide-react'
import { WizardDialog, type WizardStep } from '@/components/wizard-dialog'
import {
  ChoiceCard,
  FieldGroup,
  SectionHeading,
  SelectableCard,
  SelectBox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SwitchField,
} from '@/components/ui'
import type { EditableListItem } from '@/components/ui'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { DeliveryOptionsContent, BUYER_SUGGESTIONS, getBuyerWarning } from './delivery-options-content'
import { PricingModelSelector } from './pricing-model-selector'
import { CloneCampaignPicker } from './clone-campaign-picker'
import { LEAD_SOURCE_OPTIONS, LEAD_TYPE_OPTIONS, findCloneCampaign } from '../data/mock-campaigns'
import {
  CAMPAIGN_CHANNEL_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  DEFAULT_SCAN_COVERAGE,
  pricingLocksVerification,
  type CampaignStatus,
  type Channel,
  type PricingModel,
  type CampaignPlan,
  type DeliveryMode,
  type ScanCoverageOption,
  type TargetMode,
} from '../types'

export interface WizardData extends Record<string, unknown> {
  leadSourceName?: string
  leadSource?: string
  campaignPlan: CampaignPlan
  cloneCampaignId?: string
  cloneCampaignName?: string
  cloneCampaignStatus?: CampaignStatus
  cloneTargetLeadSource?: string
  name: string
  channel: Channel
  leadType: string
  pricingModel: string
  pricePerLead: string
  pricePerSale: string
  revenueSharePct: string
  status: CampaignStatus
  scanCoverageEnabled: boolean
  scanCoverage: ScanCoverageOption
  deliveryMode: string
  targetBuyer: string
  targetMode: string
  targetGroup: string
  automationMethod: string
  maxDeliveryCount: string
  buyers: EditableListItem[]
  useQualityControl: boolean
  duplicateDays: string
  standardizeAddress: boolean
  appendCityState: boolean
  mobileCheck: boolean
  geolocateIp: boolean
  hourLimitEnabled: boolean
  hourLimitValue: string
  dailyLimitEnabled: boolean
  dailyLimitValue: string
  monthlyLimitEnabled: boolean
  monthlyLimitValue: string
}

interface CreateCampaignWizardProps {
  open: boolean
  onClose: () => void
  onCreate: (data: WizardData) => void
  mode?: 'campaign' | 'lead-source'
}

type WizardErrorKey =
  | 'leadSourceName'
  | 'leadSource'
  | 'name'
  | 'leadType'
  | 'cloneTarget'
  | 'cloneCampaign'
  | 'cloneName'
type WizardErrors = Partial<Record<WizardErrorKey, string>>

export function CreateCampaignWizard({
  open,
  onClose,
  onCreate,
  mode = 'campaign',
}: CreateCampaignWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [errors, setErrors] = useState<WizardErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const isLeadSourceMode = mode === 'lead-source'

  // Lead Source setup
  const [leadSourceName, setLeadSourceName] = useState('')

  // How the campaign is created. Campaign-only mode chooses new vs clone; lead-source
  // mode adds a "no campaign" option. Default 'new' either way.
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan>('new')
  const [cloneTargetLeadSource, setCloneTargetLeadSource] = useState('')
  const [cloneCampaignId, setCloneCampaignId] = useState('')
  const [cloneCampaignName, setCloneCampaignName] = useState('')
  const [cloneStatus, setCloneStatus] = useState<CampaignStatus>('active')

  // Campaign setup
  const [name, setName] = useState('')
  const [leadSource, setLeadSource] = useState('')
  const [channel, setChannel] = useState<Channel>('web')
  const [leadType, setLeadType] = useState('')
  const [pricingModel, setPricingModel] = useState<PricingModel>('per-lead')
  const [pricePerLead, setPricePerLead] = useState('$10.00')
  const [pricePerSale, setPricePerSale] = useState('$0.00')
  const [revenueSharePct, setRevenueSharePct] = useState('0.00%')
  const [status, setStatus] = useState<CampaignStatus>('active')
  // Sale & Coverage Verification has no control in the wizard; it lives in Lead
  // Validation in the editor. The wizard only carries the values so that picking a
  // Revenue Share model here creates the campaign already correctly configured.
  const [scanCoverageEnabled, setScanCoverageEnabled] = useState(false)
  const [scanCoverage] = useState<ScanCoverageOption>(DEFAULT_SCAN_COVERAGE)
  const scanCoverageEnabledBeforeLock = useRef<boolean | null>(null)

  const handlePricingModelChange = (next: PricingModel) => {
    const wasLocked = pricingLocksVerification(pricingModel)
    const isLocked = pricingLocksVerification(next)

    if (isLocked && !wasLocked) {
      scanCoverageEnabledBeforeLock.current = scanCoverageEnabled
      setScanCoverageEnabled(true)
    } else if (!isLocked && wasLocked) {
      setScanCoverageEnabled(scanCoverageEnabledBeforeLock.current ?? false)
      scanCoverageEnabledBeforeLock.current = null
    }

    setPricingModel(next)
  }

  // Step 2: Delivery Options
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('any-qualified')
  const [targetBuyer, setTargetBuyer] = useState('')
  const [targetMode, setTargetMode] = useState<TargetMode>('specific-buyers')
  const [targetGroup, setTargetGroup] = useState('')
  const [automationMethod, setAutomationMethod] = useState('system-default')
  const [maxDeliveryCount, setMaxDeliveryCount] = useState('3')
  const [buyers, setBuyers] = useState<EditableListItem[]>([])

  // Step 3: Quality Options
  const [useQualityControl, setUseQualityControl] = useState(false)
  const [duplicateDays, setDuplicateDays] = useState('30')
  const [standardizeAddress, setStandardizeAddress] = useState(false)
  const [appendCityState, setAppendCityState] = useState(false)
  const [mobileCheck, setMobileCheck] = useState(false)
  const [geolocateIp, setGeolocateIp] = useState(false)

  // Step 4: Quantity Limits
  const [hourLimitEnabled, setHourLimitEnabled] = useState(false)
  const [hourLimitValue, setHourLimitValue] = useState('0')
  const [dailyLimitEnabled, setDailyLimitEnabled] = useState(false)
  const [dailyLimitValue, setDailyLimitValue] = useState('0')
  const [monthlyLimitEnabled, setMonthlyLimitEnabled] = useState(false)
  const [monthlyLimitValue, setMonthlyLimitValue] = useState('0')

  const isCloning = campaignPlan === 'clone'
  const buildsNewCampaign = campaignPlan === 'new'
  // The Lead Source dropdown in General only exists in campaign-only mode building fresh.
  const needsLeadSourceSelection = !isLeadSourceMode && buildsNewCampaign

  const showCloneTarget = !isLeadSourceMode

  const selectPlan = (plan: CampaignPlan) => {
    setCampaignPlan(plan)
    setActiveStep(0)
    if (plan !== 'clone') clearFieldErrors(['cloneTarget', 'cloneCampaign', 'cloneName'])
  }

  // Routing screen: picking a card is the action — set the plan and advance to step 1
  // (the config steps for "new", or the clone picker for "clone").
  const chooseAndAdvance = (plan: CampaignPlan) => {
    setCampaignPlan(plan)
    if (plan !== 'clone') clearFieldErrors(['cloneTarget', 'cloneCampaign', 'cloneName'])
    setActiveStep(1)
  }

  const buildValidationErrors = (fields: WizardErrorKey[]) => {
    const newErrors: WizardErrors = {}

    if (fields.includes('leadSourceName') && isLeadSourceMode && !leadSourceName.trim()) {
      newErrors.leadSourceName = 'Lead Source Name is required.'
    }

    if (fields.includes('name') && buildsNewCampaign && !name.trim()) {
      newErrors.name = 'Campaign Name is required.'
    }

    if (fields.includes('leadType') && buildsNewCampaign && !leadType) {
      newErrors.leadType = 'Lead Type is required.'
    }

    if (fields.includes('leadSource') && needsLeadSourceSelection && !leadSource) {
      newErrors.leadSource = 'Lead Source is required.'
    }

    if (fields.includes('cloneTarget') && isCloning && showCloneTarget && !cloneTargetLeadSource) {
      newErrors.cloneTarget = 'Select a target lead source.'
    }

    if (fields.includes('cloneCampaign') && isCloning && !cloneCampaignId) {
      newErrors.cloneCampaign = 'Select a campaign to clone.'
    }

    if (fields.includes('cloneName') && isCloning && !cloneCampaignName.trim()) {
      newErrors.cloneName = 'Campaign Name is required.'
    }

    return newErrors
  }

  const applyValidationErrors = (fields: WizardErrorKey[], validationErrors: WizardErrors) => {
    setErrors((prev) => {
      const next = { ...prev }

      for (const field of fields) {
        if (validationErrors[field]) {
          next[field] = validationErrors[field]
        } else {
          delete next[field]
        }
      }

      return next
    })
  }

  const validateFields = (fields: WizardErrorKey[]) => {
    applyValidationErrors(fields, buildValidationErrors(fields))
  }

  const validateField = (field: WizardErrorKey) => validateFields([field])

  const validateStep = (stepId?: string) => {
    if (stepId === 'lead-source') {
      validateFields(['leadSourceName'])
      return
    }

    if (stepId === 'clone-select') {
      validateFields(['cloneTarget', 'cloneCampaign', 'cloneName'])
      return
    }

    if (stepId === 'general') {
      validateFields(['name', 'leadType', 'leadSource'])
    }
  }

  const clearFieldError = (field: WizardErrorKey) => clearFieldErrors([field])

  const clearFieldErrors = (fields: WizardErrorKey[]) => {
    setErrors((prev) => {
      if (!fields.some((field) => prev[field])) return prev

      const next = { ...prev }
      for (const field of fields) delete next[field]
      return next
    })
  }

  const handleComplete = async () => {
    const newErrors = buildValidationErrors([
      'leadSourceName', 'name', 'leadType', 'leadSource',
      'cloneTarget', 'cloneCampaign', 'cloneName',
    ])

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstInvalidStepId = newErrors.leadSourceName
        ? 'lead-source'
        : newErrors.cloneTarget || newErrors.cloneCampaign || newErrors.cloneName
          ? 'clone-select'
          : 'general'
      const firstInvalidStepIndex = steps.findIndex((step) => step.id === firstInvalidStepId)
      if (firstInvalidStepIndex >= 0) setActiveStep(firstInvalidStepIndex)
      return
    }

    setIsSaving(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({ variant: 'success', title: 'Changes saved successfully' })

      onCreate({
        leadSourceName: isLeadSourceMode ? leadSourceName.trim() : undefined,
        leadSource: needsLeadSourceSelection ? leadSource : undefined,
        campaignPlan,
        cloneCampaignId: isCloning ? cloneCampaignId : undefined,
        cloneCampaignName: isCloning ? cloneCampaignName.trim() : undefined,
        cloneCampaignStatus: isCloning ? cloneStatus : undefined,
        cloneTargetLeadSource: isCloning && showCloneTarget ? cloneTargetLeadSource : undefined,
        name: name.trim(), channel, leadType,
        pricingModel, pricePerLead, pricePerSale, revenueSharePct, status,
        scanCoverageEnabled, scanCoverage,
        deliveryMode, targetBuyer, targetMode, targetGroup,
        automationMethod, maxDeliveryCount, buyers,
        useQualityControl, duplicateDays,
        standardizeAddress, appendCityState, mobileCheck, geolocateIp,
        hourLimitEnabled, hourLimitValue,
        dailyLimitEnabled, dailyLimitValue,
        monthlyLimitEnabled, monthlyLimitValue,
      })
      setErrors({})
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save changes',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const invalidStepIds = [
    ...(errors.leadSourceName ? ['lead-source'] : []),
    ...(errors.cloneTarget || errors.cloneCampaign || errors.cloneName ? ['clone-select'] : []),
    ...(errors.name || errors.leadType || errors.leadSource ? ['general'] : []),
  ]
  const generalStepLabel = isLeadSourceMode ? 'Campaign Settings' : 'General Information'

  // The plan chooser (new vs clone, plus "none" in lead-source mode), rendered as cards.
  const planSelector = (
    <div className="grid grid-cols-2 gap-3">
      {/* "No campaign needed" (campaignPlan 'none') is hidden for now; the plan logic
          stays in place so it can be re-enabled. */}
      <SelectableCard
        icon={<FilePlus2 className="size-5" />}
        title="Create new"
        description="Build a fresh campaign step by step."
        selected={campaignPlan === 'new'}
        onClick={() => selectPlan('new')}
      />
      <SelectableCard
        icon={<Copy className="size-5" />}
        title="Copy from existing"
        description="Copy the settings of a campaign you already have."
        selected={campaignPlan === 'clone'}
        onClick={() => selectPlan('clone')}
      />
    </div>
  )

  // Campaign-only routing screen: a card-button chooser, no sidebar, no Next (clicking a
  // card is the action). Hidden from the tab list so the sidebar (once "new" brings it
  // in) lists only the config steps.
  const campaignSourceStep: WizardStep = {
    id: 'campaign-source',
    label: 'Campaign Source',
    hidden: true,
    hidePrimaryAction: true,
    content: (
      <div className="grid grid-cols-2 gap-4 py-2">
        <ChoiceCard
          className="min-h-[200px]"
          icon={<FilePlus2 className="size-6" />}
          title="Create new"
          description="Build a fresh campaign step by step."
          onClick={() => chooseAndAdvance('new')}
        />
        <ChoiceCard
          className="min-h-[200px]"
          icon={<Copy className="size-6" />}
          title="Copy from existing"
          description="Copy the settings of a campaign you already have."
          onClick={() => chooseAndAdvance('clone')}
        />
      </div>
    ),
  }

  const cloneStep: WizardStep = {
    id: 'clone-select',
    label: 'Copy Existing Campaign',
    content: (
      <div className="flex flex-col gap-4">
        <CloneCampaignPicker
          showTarget={showCloneTarget}
          targetLeadSource={cloneTargetLeadSource}
          onTargetLeadSourceChange={(value) => {
            setCloneTargetLeadSource(value)
            if (errors.cloneTarget) clearFieldError('cloneTarget')
          }}
          campaignId={cloneCampaignId}
          onCampaignIdChange={(value) => {
            setCloneCampaignId(value)
            if (errors.cloneCampaign) clearFieldError('cloneCampaign')
            // Prefill the new name from the source campaign, unless the user typed one.
            const source = findCloneCampaign(value)
            if (source && !cloneCampaignName.trim()) {
              setCloneCampaignName(`Copy of ${source.name}`)
            }
          }}
          campaignName={cloneCampaignName}
          onCampaignNameChange={(value) => {
            setCloneCampaignName(value)
            if (errors.cloneName && value.trim()) clearFieldError('cloneName')
          }}
          status={cloneStatus}
          onStatusChange={setCloneStatus}
          errors={{ target: errors.cloneTarget, campaign: errors.cloneCampaign, name: errors.cloneName }}
        />
      </div>
    ),
  }

  const campaignSteps: WizardStep[] = [
    {
      id: 'general',
      label: generalStepLabel,
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading title={generalStepLabel} />
          <Separator className="my-0" />

          <FieldGroup label="Campaign Name" required>
            <DebouncedInput
              value={name}
              onValueCommit={(value) => {
                setName(value)
                if (errors.name) clearFieldError('name')
              }}
              onChange={(event) => {
                setName(event.target.value)
                if (errors.name) clearFieldError('name')
              }}
              onBlur={() => validateField('name')}
              placeholder="Example: Contact Us Form"
              aria-invalid={Boolean(errors.name)}
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name}</p>
            )}
          </FieldGroup>

          {needsLeadSourceSelection && (
            <FieldGroup label="Lead Source" description="The source of leads for this campaign." required>
              <SelectBox
                searchable
                options={LEAD_SOURCE_OPTIONS}
                value={leadSource}
                onValueChange={(value) => {
                  setLeadSource(value)
                  if (errors.leadSource) clearFieldError('leadSource')
                }}
                placeholder="Select lead source"
                emptyMessage="No lead sources found"
                className={cn(errors.leadSource && 'border-destructive')}
              />
              {errors.leadSource && (
                <p className="mt-1 text-xs text-destructive">{errors.leadSource}</p>
              )}
            </FieldGroup>
          )}

          <FieldGroup label="Lead Type" description="The lead field schema for this vertical." required>
            <SelectBox
              options={LEAD_TYPE_OPTIONS}
              value={leadType}
              onValueChange={(value) => {
                setLeadType(value)
                if (errors.leadType) clearFieldError('leadType')
              }}
              placeholder="Select lead type"
              className={cn(errors.leadType && 'border-destructive')}
            />
            {errors.leadType && (
              <p className="mt-1 text-xs text-destructive">{errors.leadType}</p>
            )}
          </FieldGroup>

          <FieldGroup label="Channel" description="The channel of capturing leads.">
            <Select value={channel} onValueChange={(value) => setChannel(value as Channel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_CHANNEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Status" description="Select the initial status for the new campaign.">
            <Select value={status} onValueChange={(value) => setStatus(value as CampaignStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs leading-4 text-muted-foreground mt-2">
              <span className="font-semibold">Note:</span> Only active campaigns can accept leads.
            </p>
          </FieldGroup>

          <div className="flex flex-col gap-5 rounded-[4px] border border-border bg-background p-5">
            <SectionHeading title="Payout Options" size="sm" />

            <PricingModelSelector
              value={pricingModel}
              onChange={handlePricingModelChange}
              pricePerLead={pricePerLead}
              onPricePerLeadChange={setPricePerLead}
              pricePerSale={pricePerSale}
              onPricePerSaleChange={setPricePerSale}
              revenueSharePct={revenueSharePct}
              onRevenueSharePctChange={setRevenueSharePct}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'delivery',
      label: 'Delivery Options',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading title="Delivery Options" />
          <Separator className="my-0" />
          <DeliveryOptionsContent
            framed
            deliveryMode={deliveryMode}
            onDeliveryModeChange={setDeliveryMode}
            targetMode={targetMode}
            onTargetModeChange={setTargetMode}
            selectedBuyer={targetBuyer}
            onSelectedBuyerChange={setTargetBuyer}
            selectedGroup={targetGroup}
            onSelectedGroupChange={setTargetGroup}
            buyers={buyers}
            onAddBuyer={(value) => {
              const s = BUYER_SUGGESTIONS.find((b) => b.value === value)
              if (s) {
                setBuyers((prev) => [...prev, {
                  id: s.value,
                  label: s.label,
                  warning: getBuyerWarning(s.value),
                }])
              }
            }}
            onRemoveBuyer={(id) => setBuyers((prev) => prev.filter((b) => b.id !== id))}
            automationMethod={automationMethod}
            onAutomationMethodChange={setAutomationMethod}
            maxDeliveryCount={maxDeliveryCount}
            onMaxDeliveryCountChange={setMaxDeliveryCount}
          />
        </div>
      ),
    },
    {
      id: 'quality',
      label: 'Quality Options',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading title="Quality Options" />
          <Separator className="my-0" />

          <SwitchField
            label="Use Quality Control"
            description="Specify if this Campaign should move new leads into quality control."
            checked={useQualityControl}
            onCheckedChange={setUseQualityControl}
          />

          <Separator className="my-0" />

          <FieldGroup label="Duplicate Day Setting" description="Specify how many days back the duplicate check should apply.">
            <DebouncedInput
              value={duplicateDays}
              onValueCommit={setDuplicateDays}
              placeholder="30 Days"
            />
          </FieldGroup>

          <Separator className="my-0" />

          <SwitchField
            label="Standardize Address"
            meta="$0.03 per lead"
            description="Apply industry standardization to the primary address."
            checked={standardizeAddress}
            onCheckedChange={setStandardizeAddress}
          />

          <Separator className="my-0" />

          <SwitchField
            label="Append City and State"
            meta="$0.03 per lead"
            description="Leads received with a postal code and country will attempt to append a city and state."
            checked={appendCityState}
            onCheckedChange={setAppendCityState}
          />

          <Separator className="my-0" />

          <SwitchField
            label="Mobile Check"
            meta="$0.03 per lead"
            description="Check if the lead's primary phone number is a mobile number."
            checked={mobileCheck}
            onCheckedChange={setMobileCheck}
          />

          <Separator className="my-0" />

          <SwitchField
            label="Geolocate IP Address"
            description="Geolocation IP address of the lead. (fee may apply)"
            checked={geolocateIp}
            onCheckedChange={setGeolocateIp}
          />
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity Limits',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading title="Quantity Limits" />
          <Separator className="my-0" />

          <SwitchField
            label="Hour Limit"
            description="The amount of leads that can be received within 60 minutes"
            checked={hourLimitEnabled}
            onCheckedChange={setHourLimitEnabled}
          >
            <Input
              value={hourLimitValue}
              onChange={(e) => setHourLimitValue(e.target.value)}
            />
          </SwitchField>

          <Separator className="my-0" />

          <SwitchField
            label="Daily Limit"
            description="The amount of leads that can be received in a single day"
            checked={dailyLimitEnabled}
            onCheckedChange={setDailyLimitEnabled}
          >
            <Input
              value={dailyLimitValue}
              onChange={(e) => setDailyLimitValue(e.target.value)}
            />
          </SwitchField>

          <Separator className="my-0" />

          <SwitchField
            label="Monthly Limit"
            description="The amount of leads that can be received in a single month"
            checked={monthlyLimitEnabled}
            onCheckedChange={setMonthlyLimitEnabled}
          >
            <Input
              value={monthlyLimitValue}
              onChange={(e) => setMonthlyLimitValue(e.target.value)}
            />
          </SwitchField>
        </div>
      ),
    },
    {
      id: 'next-steps',
      label: 'Next Steps',
      content: (
        <div className="flex flex-col gap-4">
          <SectionHeading title="Next Steps" />
          <Separator className="my-0" />

          <p className="text-sm leading-5 text-foreground">
            You can complete your initial setup by clicking the Create button below,
            after our new lead source campaign is created you will be automatically directed
            to the detail page to finish your campaign setup.
          </p>

          <p className="text-sm leading-5 text-foreground">
            Below are some items that you will want to review:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-sm leading-5 text-foreground">
            <li>
              Your campaign information will auto-open, review and add any criteria,
              revenue requirements or quantity limits needed.
            </li>
            <li>
              Since you have selected the web leads method, you will want to generate
              posting instructions and submit these to your developer or affiliate partner
              that is submitting leads.
            </li>
          </ul>

          <p className="text-sm leading-5 text-foreground">
            Press &quot;Create&quot; to continue...
          </p>
        </div>
      ),
    },
  ]
  const leadSourceStep: WizardStep = {
    id: 'lead-source',
    label: 'Lead Source',
    content: (
      <div className="flex flex-col gap-4">
        <SectionHeading title="Lead Source Details" />
        <Separator className="my-0" />

        <FieldGroup label="Lead Source Name" required>
          <DebouncedInput
            value={leadSourceName}
            onValueCommit={(value) => {
              setLeadSourceName(value)
              if (errors.leadSourceName) {
                clearFieldError('leadSourceName')
              }
            }}
            onChange={(event) => {
              setLeadSourceName(event.target.value)
              if (errors.leadSourceName) {
                clearFieldError('leadSourceName')
              }
            }}
            onBlur={() => validateField('leadSourceName')}
            placeholder="Example: Acme Web Leads"
            aria-invalid={Boolean(errors.leadSourceName)}
            className={cn(errors.leadSourceName && 'border-destructive')}
          />
          {errors.leadSourceName && (
            <p className="mt-1 text-xs text-destructive">{errors.leadSourceName}</p>
          )}
        </FieldGroup>

        <Separator className="my-0" />

        <FieldGroup label="Campaign" description="Add a campaign as part of creating this lead source.">
          {planSelector}
        </FieldGroup>
      </div>
    ),
  }

  // 'new' appends the full config steps; 'clone' adds the picker step; 'none' ends here.
  const planStep = isLeadSourceMode ? leadSourceStep : campaignSourceStep
  const steps: WizardStep[] = buildsNewCampaign
    ? [planStep, ...campaignSteps]
    : isCloning
      ? [planStep, cloneStep]
      : [planStep]
  // Campaign-only: no sidebar on the routing step or the clone path — the tabs appear
  // only once "new" leads into the config steps. Lead-source keeps its normal sidebar.
  const showSidebarNav = isLeadSourceMode
    ? steps.length > 1
    : buildsNewCampaign && activeStep > 0
  // No sidebar → a narrower modal. The routing chooser gets a touch more room for its
  // two side-by-side cards.
  const onCampaignRoutingStep = !isLeadSourceMode && activeStep === 0
  const dialogWidth = onCampaignRoutingStep ? '620px' : showSidebarNav ? undefined : '560px'

  // Sidebar-less content steps (e.g. the copy screen) show the step name as the header,
  // since there's no tab to surface it. Routing and sidebar steps use the base title.
  const baseTitle = isLeadSourceMode ? 'Create Lead Source' : 'Create Campaign'
  const dialogTitle =
    !showSidebarNav && activeStep > 0 && steps[activeStep]?.label
      ? steps[activeStep].label
      : baseTitle

  return (
    <WizardDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={dialogTitle}
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      onNext={(fromStep) => validateStep(steps[fromStep]?.id)}
      onCancel={onClose}
      onComplete={handleComplete}
      completeLabel="Create and Open"
      completeVariant="success"
      showSidebarNav={showSidebarNav}
      width={dialogWidth}
      invalidStepIds={invalidStepIds}
      isSaving={isSaving}
      savingMessage="Saving..."
    />
  )
}
