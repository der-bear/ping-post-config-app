import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { initializeDeliveryMethod } from '@/features/delivery-method/initialize-delivery-method'
import { FeatureEntry } from '@/components/feature-entry'
import { CreateDeliveryMethodModal } from './create-delivery-method-modal'
import { DeliveryMethodEditor } from './index'

export function DeliveryMethodEntry() {
  const isPanelExpanded = useDeliveryMethodStore((s) => s.isPanelExpanded)

  const handleBeforeCreate = (data: Record<string, unknown>) => {
    initializeDeliveryMethod({
      method: data.method as string,
      description: data.description as string,
      leadType: data.leadType as string,
    })
  }

  return (
    <FeatureEntry
      CreateModal={CreateDeliveryMethodModal}
      Editor={DeliveryMethodEditor}
      onBeforeCreate={handleBeforeCreate}
      isPanelExpanded={isPanelExpanded}
    />
  )
}
