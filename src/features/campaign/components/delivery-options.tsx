import { useCampaignStore } from '../store'
import { DeliveryOptionsContent, BUYER_SUGGESTIONS, getBuyerWarning } from './delivery-options-content'

export function DeliveryOptions() {
  const options = useCampaignStore((s) => s.config.deliveryOptions)
  const update = useCampaignStore((s) => s.updateDeliveryOptions)
  const addBuyer = useCampaignStore((s) => s.addBuyer)
  const removeBuyer = useCampaignStore((s) => s.removeBuyer)

  return (
    <DeliveryOptionsContent
      compact
      stacked
      deliveryMode={options.deliveryMode}
      onDeliveryModeChange={(v) => update({ deliveryMode: v })}
      targetMode={options.targetMode}
      onTargetModeChange={(v) => update({ targetMode: v })}
      selectedBuyer={options.selectedBuyer}
      onSelectedBuyerChange={(v) => update({ selectedBuyer: v })}
      selectedGroup={options.selectedGroup}
      onSelectedGroupChange={(v) => update({ selectedGroup: v })}
      buyers={options.buyers.map((b) => ({
        id: b.id,
        label: b.name,
        warning: b.warning,
      }))}
      onAddBuyer={(value) => {
        const s = BUYER_SUGGESTIONS.find((b) => b.value === value)
        if (s) addBuyer({ id: s.value, name: s.label, warning: getBuyerWarning(s.value) })
      }}
      onRemoveBuyer={removeBuyer}
      automationMethod={options.automationMethod}
      onAutomationMethodChange={(v) => update({ automationMethod: v })}
      maxDeliveryCount={options.maxDeliveryCount}
      onMaxDeliveryCountChange={(v) => update({ maxDeliveryCount: v })}
    />
  )
}
