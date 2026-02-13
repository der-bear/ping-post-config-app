import { useState } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { CreateDeliveryMethodModal } from './create-delivery-method-modal'
import { DeliveryMethodEditor } from './index'

export function DeliveryMethodEntry() {
  const [showCreateModal, setShowCreateModal] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  const updateGeneral = useDeliveryMethodStore((s) => s.updateGeneral)
  const resetStore = useDeliveryMethodStore((s) => s.resetStore)
  const isPanelExpanded = useDeliveryMethodStore((s) => s.isPanelExpanded)

  const handleCreate = (data: { method: string; description: string; leadType: string }) => {
    // Reset store to default state for new method creation
    resetStore()
    // Update the store with initial data
    updateGeneral({
      description: data.description,
      leadType: data.leadType,
    })
    setShowCreateModal(false)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setShowCreateModal(true)
  }

  return (
    <>
      {showEditor && (
        <div className="h-screen flex flex-col p-4 md:p-8">
          <div
            className="mx-auto w-full flex-1 min-h-0 transition-[max-width] duration-200"
            style={{ maxWidth: isPanelExpanded ? 800 : 600, minWidth: 480 }}
          >
            <DeliveryMethodEditor onClose={handleEditorClose} />
          </div>
        </div>
      )}

      <CreateDeliveryMethodModal
        open={showCreateModal}
        onClose={() => {
          // For prototype: closing just keeps the modal open as entry point
          // In production with a list view, this would actually close
        }}
        onCreate={handleCreate}
      />
    </>
  )
}
