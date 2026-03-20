import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FeatureEntry } from '@/components/feature-entry'
import { CreateDeliveryMethodModal } from './create-delivery-method-modal'
import { DeliveryMethodEditor } from './index'

export function DeliveryMethodEntry() {
  const updateGeneral = useDeliveryMethodStore((s) => s.updateGeneral)
  const resetStore = useDeliveryMethodStore((s) => s.resetStore)
  const isPanelExpanded = useDeliveryMethodStore((s) => s.isPanelExpanded)

  const handleBeforeCreate = (data: Record<string, unknown>) => {
    resetStore()
    updateGeneral({
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
