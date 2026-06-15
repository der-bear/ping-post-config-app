import { User, Users, Workflow } from 'lucide-react'
import type { ReactNode } from 'react'
import type { EditableListItem } from '@/components/ui'
import {
  FieldGroup,
  SectionHeading,
  SelectableCard,
  SelectBox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiSelect,
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

const REAL_NAMES = [
  'Cody Fisher', 'Bessie Cooper', 'Brooklyn Simmons', 'Devon Lane', 'Jenny Wilson',
  'Robert Fox', 'Jane Cooper', 'Wade Warren', 'Esther Howard', 'Cameron Williamson',
  'Leslie Alexander', 'Kristin Watson', 'Albert Flores', 'Marvin McKinney', 'Jacob Jones',
  'Theresa Webb', 'Kathryn Murphy', 'Ralph Edwards', 'Floyd Miles', 'Eleanor Pena',
  'Annette Black', 'Darrell Steward', 'Guy Hawkins', 'Arlene McCoy', 'Dianne Russell',
  'Courtney Henry', 'Darlene Robertson', 'Savannah Nguyen', 'Ronald Richards', 'Jerome Bell',
]
export const BUYER_SUGGESTIONS = Array.from({ length: 120 }, (_, i) => {
  const name = REAL_NAMES[i % REAL_NAMES.length]
  const suffix = Math.floor(i / REAL_NAMES.length) + 1
  return {
    value: `buyer-${i + 1}`,
    label: suffix > 1 ? `${name} ${suffix}` : name,
  }
})

export function getBuyerWarning(id: string): string | undefined {
  return id === 'devon-lane'
    ? "This client doesn't have eligible client campaigns to receive leads yet."
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
  /** When true, wrap sub-sections (Select Target Client / Distribution Settings) in bordered cards.
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
        Choose how leads will be distributed: to a specific client, a group of clients, or all qualified clients.
      </p>

      <div className={stacked ? 'flex flex-col gap-3' : 'grid grid-cols-3 gap-3'}>
        <SelectableCard
          icon={<Workflow className="size-5" />}
          title="Any Qualified"
          description="Distribute leads among all qualified clients."
          selected={deliveryMode === 'any-qualified'}
          onClick={() => onDeliveryModeChange('any-qualified')}
          compact={compact}
        />
        <SelectableCard
          icon={<User className="size-5" />}
          title="Single Client"
          description="Deliver leads to one client only."
          selected={deliveryMode === 'single'}
          onClick={() => onDeliveryModeChange('single')}
          compact={compact}
        />
        <SelectableCard
          icon={<Users className="size-5" />}
          title="Multiple Clients"
          description="Distribute leads among selected clients."
          selected={deliveryMode === 'multiple'}
          onClick={() => onDeliveryModeChange('multiple')}
          compact={compact}
        />
      </div>

      {/* Single Client */}
      {deliveryMode === 'single' && (
        <>
          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <FieldGroup label="Select Target Client">
              <SelectBox
                searchable
                options={BUYER_SUGGESTIONS}
                value={selectedBuyer}
                onValueChange={onSelectedBuyerChange}
                placeholder="Select a client"
                emptyMessage="No clients found"
              />
            </FieldGroup>
          </Section>
        </>
      )}

      {/* Multiple Clients */}
      {deliveryMode === 'multiple' && (
        <>
          {!framed && <Separator className="my-0" />}
          <Section framed={framed}>
            <SectionHeading title="Select Target Client" />

            <RadioGroup value={targetMode} onValueChange={onTargetModeChange} className="flex gap-4">
              <label htmlFor="do-specific" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="specific-buyers" id="do-specific" />
                <span className="text-sm">Select specific clients</span>
              </label>
              <label htmlFor="do-group" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="delivery-group" id="do-group" />
                <span className="text-sm">Select delivery group</span>
              </label>
            </RadioGroup>

            {targetMode === 'specific-buyers' ? (
              <FieldGroup label={`Clients (${buyers.length})`}>
                <MultiSelect
                  options={BUYER_SUGGESTIONS}
                  value={buyers.map((b) => b.id)}
                  onValueChange={(nextIds) => {
                    const current = new Set(buyers.map((b) => b.id))
                    const next = new Set(nextIds)
                    nextIds.forEach((id) => {
                      if (!current.has(id)) onAddBuyer(id)
                    })
                    buyers.forEach((b) => {
                      if (!next.has(b.id)) onRemoveBuyer(b.id)
                    })
                  }}
                  placeholder="Select clients"
                  emptyMessage="No clients found"
                />
              </FieldGroup>
            ) : (
              <div className="flex flex-col gap-2">
                <FieldGroup>
                  <SelectBox
                    searchable
                    options={[
                      { value: 'group-1', label: 'Premium Clients Group' },
                      { value: 'group-2', label: 'Standard Clients Group' },
                    ]}
                    value={selectedGroup}
                    onValueChange={onSelectedGroupChange}
                    placeholder="Select a clients delivery group"
                    emptyMessage="No delivery groups found"
                  />
                </FieldGroup>
                <p className="text-xs leading-4 text-text-medium">
                  Navigate to the <a href="#" className="text-primary hover:underline">&quot;Clients Delivery Groups&quot;</a> management screen.
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
        <Select value={automationMethod} onValueChange={onAutomationMethodChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Automation</SelectItem>
            <SelectItem value="system-default">System Default (Price)</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="round-robin">Round Robin</SelectItem>
            <SelectItem value="weighted">Weighted</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="geolocation">Geolocation</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Maximum Delivery Count" description="The amount of times a lead from this campaign can be automatically delivered out.">
        <Select value={maxDeliveryCount} onValueChange={onMaxDeliveryCountChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Up to 1 Delivery</SelectItem>
            <SelectItem value="3">Up to 3 Deliveries</SelectItem>
            <SelectItem value="5">Up to 5 Deliveries</SelectItem>
            <SelectItem value="10">Up to 10 Deliveries</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
    </>
  )
}
