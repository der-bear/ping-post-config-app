import { User, Users, Settings2 } from 'lucide-react'
import type { EditableListItem } from '@/components/ui'
import {
  FieldGroup,
  SectionHeading,
  SelectableCard,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EditableList,
} from '@/components/ui'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { DeliveryMode, TargetMode } from '../types'

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
}: DeliveryOptionsContentProps) {
  return (
    <div className="space-y-5">
      <SectionHeading
        title="Deliver Options"
        description="Choose how leads will be distributed: to a specific buyer, a group of buyers, or all qualified buyers."
      />

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
          icon={<Settings2 className="size-5" />}
          title="Any Qualified"
          description="Distribute leads among all qualified buyers."
          selected={deliveryMode === 'any-qualified'}
          onClick={() => onDeliveryModeChange('any-qualified')}
          compact={compact}
        />
      </div>

      {/* Single Buyer */}
      {deliveryMode === 'single' && (
        <FieldGroup label="Select Target Buyer">
          <Select value={selectedBuyer} onValueChange={onSelectedBuyerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a buyer" />
            </SelectTrigger>
            <SelectContent>
              {BUYER_SUGGESTIONS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      )}

      {/* Multiple Buyers */}
      {deliveryMode === 'multiple' && (
        <>
          <div className="rounded-sm border border-border p-4 space-y-4">
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
              <div className="space-y-2">
                <FieldGroup>
                  <Select value={selectedGroup} onValueChange={onSelectedGroupChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a buyers delivery group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group-1">Premium Buyers Group</SelectItem>
                      <SelectItem value="group-2">Standard Buyers Group</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>
                <p className="text-xs text-muted-foreground">
                  Navigate to the <a href="#" className="text-primary hover:underline">&quot;Buyers Delivery Groups&quot;</a> management screen.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-sm border border-border p-4 space-y-4">
            <DistributionSettings
              automationMethod={automationMethod}
              onAutomationMethodChange={onAutomationMethodChange}
              maxDeliveryCount={maxDeliveryCount}
              onMaxDeliveryCountChange={onMaxDeliveryCountChange}
            />
          </div>
        </>
      )}

      {/* Any Qualified */}
      {deliveryMode === 'any-qualified' && (
        <DistributionSettings
          automationMethod={automationMethod}
          onAutomationMethodChange={onAutomationMethodChange}
          maxDeliveryCount={maxDeliveryCount}
          onMaxDeliveryCountChange={onMaxDeliveryCountChange}
        />
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
            <SelectItem value="priority">Priority (System Default)</SelectItem>
            <SelectItem value="round-robin">Round Robin</SelectItem>
            <SelectItem value="weighted">Weighted Distribution</SelectItem>
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
