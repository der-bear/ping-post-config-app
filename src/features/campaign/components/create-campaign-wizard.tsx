import { useState } from 'react'
import { WizardDialog, type WizardStep } from '@/components/wizard-dialog'
import {
  FieldGroup,
  SectionHeading,
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
import { DeliveryOptionsContent, BUYER_SUGGESTIONS, getBuyerWarning } from './delivery-options-content'
import { PricingModelSelector } from './pricing-model-selector'
import type { PricingModel, DeliveryMode, TargetMode } from '../types'

export interface WizardData extends Record<string, unknown> {
  name: string
  channel: string
  leadType: string
  pricingModel: string
  pricePerLead: string
  pricePerSale: string
  revenueSharePct: string
  status: string
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
}

export function CreateCampaignWizard({ open, onClose, onCreate }: CreateCampaignWizardProps) {
  const [activeStep, setActiveStep] = useState(0)

  // Step 1: General Information
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('web-leads')
  const [leadType, setLeadType] = useState('mortgage')
  const [pricingModel, setPricingModel] = useState<PricingModel>('per-lead')
  const [pricePerLead, setPricePerLead] = useState('$10.00')
  const [pricePerSale, setPricePerSale] = useState('$0.00')
  const [revenueSharePct, setRevenueSharePct] = useState('0.00%')
  const [status, setStatus] = useState('active')

  // Step 2: Delivery Options
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('single')
  const [targetBuyer, setTargetBuyer] = useState('')
  const [targetMode, setTargetMode] = useState<TargetMode>('specific-buyers')
  const [targetGroup, setTargetGroup] = useState('')
  const [automationMethod, setAutomationMethod] = useState('priority')
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

  const handleComplete = () => {
    onCreate({
      name: name.trim(), channel, leadType,
      pricingModel, pricePerLead, pricePerSale, revenueSharePct, status,
      deliveryMode, targetBuyer, targetMode, targetGroup,
      automationMethod, maxDeliveryCount, buyers,
      useQualityControl, duplicateDays,
      standardizeAddress, appendCityState, mobileCheck, geolocateIp,
      hourLimitEnabled, hourLimitValue,
      dailyLimitEnabled, dailyLimitValue,
      monthlyLimitEnabled, monthlyLimitValue,
    })
    setActiveStep(0)
    setName('')
    setChannel('web-leads')
    setLeadType('mortgage')
  }

  const steps: WizardStep[] = [
    {
      id: 'general',
      label: 'General Information',
      content: (
        <div className="space-y-5">
          <SectionHeading title="General Information" />

          <FieldGroup label="Campaign Name">
            <DebouncedInput
              value={name}
              onValueCommit={setName}
              placeholder="Required (Example: Contact Us Form)"
            />
          </FieldGroup>

          <FieldGroup label="Channel" description="The channel of capturing leads.">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web-leads">Web Leads</SelectItem>
                <SelectItem value="phone-calls">Phone Calls</SelectItem>
                <SelectItem value="live-transfer">Live Transfer</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup label="Lead Type" description="The lead field schema for this vertical.">
            <Select value={leadType} onValueChange={setLeadType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="auto-insurance">Auto Insurance</SelectItem>
                <SelectItem value="home-insurance">Home Insurance</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>

          <PricingModelSelector
            value={pricingModel}
            onChange={setPricingModel}
            pricePerLead={pricePerLead}
            onPricePerLeadChange={setPricePerLead}
            pricePerSale={pricePerSale}
            onPricePerSaleChange={setPricePerSale}
            revenueSharePct={revenueSharePct}
            onRevenueSharePctChange={setRevenueSharePct}
          />

          <FieldGroup label="Status" description="Select the current status of this campaign">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground italic mt-1">
              <strong>Note:</strong> Only active campaigns can successfully send in leads, all other statuses will be rejected.
            </p>
          </FieldGroup>
        </div>
      ),
    },
    {
      id: 'delivery',
      label: 'Delivery Options',
      content: (
        <DeliveryOptionsContent
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
      ),
    },
    {
      id: 'quality',
      label: 'Quality Options',
      content: (
        <div className="space-y-5">
          <SectionHeading title="Quality Options" />

          <SwitchField
            label="Use Quality Control"
            description="Specify if this Campaign should move new leads into quality control."
            checked={useQualityControl}
            onCheckedChange={setUseQualityControl}
          />

          <FieldGroup label="Duplicate Day Setting" description="Specify how many days back the duplicate check should apply.">
            <DebouncedInput
              value={duplicateDays}
              onValueCommit={setDuplicateDays}
              placeholder="30 Days"
            />
          </FieldGroup>

          <Separator />

          <div className="divide-y divide-border">
            <div className="pb-4">
              <SwitchField
                label="Standardize Address"
                meta="$0.03 per lead"
                description="Apply industry standardization to the primary address."
                checked={standardizeAddress}
                onCheckedChange={setStandardizeAddress}
              />
            </div>

            <div className="py-4">
              <SwitchField
                label="Append City and State"
                meta="$0.03 per lead"
                description="Leads received with a postal code and country will attempt to append a city and state."
                checked={appendCityState}
                onCheckedChange={setAppendCityState}
              />
            </div>

            <div className="py-4">
              <SwitchField
                label="Mobile Check"
                meta="$0.03 per lead"
                description="Check if the lead's primary phone number is a mobile number."
                checked={mobileCheck}
                onCheckedChange={setMobileCheck}
              />
            </div>

            <div className="pt-4">
              <SwitchField
                label="Geolocate IP Address"
                description="Geolocation IP address of the lead. (fee may apply)"
                checked={geolocateIp}
                onCheckedChange={setGeolocateIp}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity Limits',
      content: (
        <div className="space-y-5">
          <SectionHeading title="Quantity Limits" />

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
        <div className="space-y-4">
          <SectionHeading title="Next Steps" />

          <p className="text-sm text-muted-foreground">
            You can complete your initial setup by clicking the Create button below,
            after our new lead provider campaign is created you will be automatically directed
            to the detail page to finish your campaign setup.
          </p>

          <p className="text-sm text-muted-foreground">
            Below are some items that you will want to review:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
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

          <p className="text-sm text-muted-foreground italic">
            Press &quot;Create&quot; to continue...
          </p>
        </div>
      ),
    },
  ]

  return (
    <WizardDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title="Create a Lead Source Campaign"
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      onCancel={onClose}
      onComplete={handleComplete}
      completeLabel="Create and Open"
      completeVariant="success"
      canAdvance={activeStep === 0 ? name.trim() !== '' : true}
    />
  )
}
