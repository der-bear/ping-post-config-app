import { User, Users, Workflow } from 'lucide-react'
import type { ReactNode } from 'react'
import type { EditableListItem } from '@/components/ui'
import {
  FieldGroup,
  SectionHeading,
  SelectableCard,
  SearchableSelect,
  EditableList,
  Separator,
} from '@/components/ui'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { DeliveryMode, TargetMode } from '../types'

// Section wrapper: bordered card (modal/wizard) or plain stack (flyout).
function Section({
  framed,
  children,
  className,
}: {
  framed: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 w-full',
        framed && 'gap-5 rounded-[4px] border border-border bg-background p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const BUYER_SUGGESTIONS = [
  { value: 'cody-fisher', label: 'Cody Fisher' },
  { value: 'bessie-cooper', label: 'Bessie Cooper' },
  { value: 'brooklyn-simmons', label: 'Brooklyn Simmons' },
  { value: 'devon-lane', label: 'Devon Lane' },
  { value: 'jenny-wilson', label: 'Jenny Wilson' },
]

export function getBuyerWarning(id: string): string | undefined {
  return id === 'devon-lane'
    ? "This buyer doesn't have eligible buyer campaigns to receive leads yet."
    : undefined
}

interface DeliveryOptionsContentProps {
  deliveryMode: DeliveryMode
  onDeliveryModeChange: (mode: DeliveryMode) => void
  targetMode: TargetMode
  onTargetModeChange: (mode: TargetMode) => void
  selectedBuyer: string
  onSelectedBuyerChange: (value: string) => void
  selectedGroup: string
  onSelectedGroupChange: (value: string) => void
  buyers: EditableListItem[]
  onAddBuyer: (value: string) => void
  onRemoveBuyer: (id: string) => void
  automationMethod: string
  onAutomationMethodChange: (value: string) => void
  maxDeliveryCount: string
  onMaxDeliveryCountChange: (value: string) => void
  compact?: boolean
  stacked?: boolean
  /** When true, wrap sub-sections (Select Target Buyer / Distribution Settings) in bordered cards.
   *  When false (flyout default), separate sub-sections with horizontal dividers. */
  framed?: boolean
}

export function DeliveryOptionsContent({
  deliveryMode,
  onDeliveryModeChange,
  targetMode,
  onTargetModeChange,
  selectedBuyer,
  onSelectedBuyerChange,
  selectedGroup,
  onSelectedGroupChange,
  buyers,
  onAddBuyer,
  onRemoveBuyer,
  automationMethod,
  onAutomationMethodChange,
  maxDeliveryCount,
  onMaxDeliveryCountChange,
  compact = false,
  stacked = false,
  framed = false,
}: DeliveryOptionsContentProps) {
  // When unframed, dividers separate sections; gap is uniform 16px.
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs leading-4 text-text-medium">
        Choose how leads will be distributed: to a specific buyer, a group of buyers, or all qualified buyers.
      </p>

      <div className={stacked ? 'flex flex-col gap-3' : 'grid grid-cols-3 gap-3'}>
        <SelectableCard
          icon={<User className="size-5" />}
          title="Single Buyer"
          description="Deliver leads to one buyer only."
          selected={deliveryMode === 'single'}
          onClick={() => onDeliveryModeChange('single')}
          compact={compact}
        />
        <SelectableCard
          icon={<Users className="size-5" />}
          title="Multiple Buyers"
          description="Distribute leads among selected buyers."
          selected={deliveryMode === 'multiple'}
          onClick={() => onDeliveryModeChange('multiple')}
          compact={compact}
        />
        <SelectableCard
          icon={<Workflow className="size-5" />}
          title="Any Qualified"
          description="Distribute leads among all qualified buyers."
          selected={deliveryMode === 'any-qualified'}
          onClick={() => onDeliveryModeChange('any-qualified')}
          compact={compact}
        />
      </div>

      {/* Single Buyer */}
      {deliveryMode === 'single' && (
        <>
          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <FieldGroup label="Select Target Buyer">
              <SearchableSelect
                options={BUYER_SUGGESTIONS}
                value={selectedBuyer}
                onValueChange={onSelectedBuyerChange}
                placeholder="Select a buyer"
                emptyMessage="No clients found"
              />
            </FieldGroup>
          </Section>
        </>
      )}

      {/* Multiple Buyers */}
      {deliveryMode === 'multiple' && (
        <>
          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <SectionHeading title="Select Target Buyer" />

            <RadioGroup value={targetMode} onValueChange={onTargetModeChange} className="flex gap-4">
              <label htmlFor="do-specific" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="specific-buyers" id="do-specific" />
                <span className="text-sm">Select specific buyers</span>
              </label>
              <label htmlFor="do-group" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="delivery-group" id="do-group" />
                <span className="text-sm">Select delivery group</span>
              </label>
            </RadioGroup>

            {targetMode === 'specific-buyers' ? (
              <EditableList
                items={buyers}
                onAdd={onAddBuyer}
                onRemove={onRemoveBuyer}
                placeholder="Select a buyer to add"
                suggestions={BUYER_SUGGESTIONS}
                heading={`Buyers (${buyers.length})`}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <FieldGroup>
                  <SearchableSelect
                    options={[
                      { value: 'group-1', label: 'Premium Buyers Group' },
                      { value: 'group-2', label: 'Standard Buyers Group' },
                    ]}
                    value={selectedGroup}
                    onValueChange={onSelectedGroupChange}
                    placeholder="Select a buyers delivery group"
                  />
                </FieldGroup>
                <p className="text-xs leading-4 text-text-medium">
                  Navigate to the <a href="#" className="text-primary hover:underline">&quot;Buyers Delivery Groups&quot;</a> management screen.
                </p>
              </div>
            )}
          </Section>

          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <DistributionSettings
              automationMethod={automationMethod}
              onAutomationMethodChange={onAutomationMethodChange}
              maxDeliveryCount={maxDeliveryCount}
              onMaxDeliveryCountChange={onMaxDeliveryCountChange}
            />
          </Section>
        </>
      )}

      {/* Any Qualified */}
      {deliveryMode === 'any-qualified' && (
        <>
          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <DistributionSettings
              automationMethod={automationMethod}
              onAutomationMethodChange={onAutomationMethodChange}
              maxDeliveryCount={maxDeliveryCount}
              onMaxDeliveryCountChange={onMaxDeliveryCountChange}
            />
          </Section>
        </>
      )}
    </div>
  )
}

function DistributionSettings({
  automationMethod,
  onAutomationMethodChange,
  maxDeliveryCount,
  onMaxDeliveryCountChange,
}: {
  automationMethod: string
  onAutomationMethodChange: (v: string) => void
  maxDeliveryCount: string
  onMaxDeliveryCountChange: (v: string) => void
}) {
  return (
    <>
      <SectionHeading title="Distribution Settings" />
      <FieldGroup label="Automation Method" description="Supply which automation preference should take place when delivering leads.">
        <SearchableSelect
          options={[
            { value: 'none', label: 'No Automation' },
            { value: 'system-default', label: 'System Default (Price)' },
            { value: 'price', label: 'Price' },
            { value: 'priority', label: 'Priority' },
            { value: 'round-robin', label: 'Round Robin' },
            { value: 'weighted', label: 'Weighted' },
            { value: 'percentage', label: 'Percentage' },
            { value: 'geolocation', label: 'Geolocation' },
          ]}
          value={automationMethod}
          onValueChange={onAutomationMethodChange}
        />
      </FieldGroup>
      <FieldGroup label="Maximum Delivery Count" description="The amount of times a lead from this campaign can be automatically delivered out.">
        <SearchableSelect
          options={[
            { value: '1', label: 'Up to 1 Delivery' },
            { value: '3', label: 'Up to 3 Deliveries' },
            { value: '5', label: 'Up to 5 Deliveries' },
            { value: '10', label: 'Up to 10 Deliveries' },
          ]}
          value={maxDeliveryCount}
          onValueChange={onMaxDeliveryCountChange}
        />
      </FieldGroup>
    </>
  )
}
