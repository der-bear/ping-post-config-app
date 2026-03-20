import { useState, type ComponentType } from 'react'

interface FeatureEntryProps {
  CreateModal: ComponentType<{
    open: boolean
    onClose: () => void
    onCreate: (data: Record<string, unknown>) => void
  }>
  Editor: ComponentType<{ onClose: () => void }>
  onBeforeCreate: (data: Record<string, unknown>) => void
  isPanelExpanded: boolean
}

export function FeatureEntry({
  CreateModal,
  Editor,
  onBeforeCreate,
  isPanelExpanded,
}: FeatureEntryProps) {
  const [showModal, setShowModal] = useState(true)
  const [showEditor, setShowEditor] = useState(false)

  const handleCreate = (data: Record<string, unknown>) => {
    onBeforeCreate(data)
    setShowModal(false)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setShowModal(true)
  }

  return (
    <>
      {showEditor && (
        <div className="flex-1 min-h-0 flex flex-col p-4 md:p-8">
          <div
            className="mx-auto w-full flex-1 min-h-0 transition-[max-width] duration-200"
            style={{ maxWidth: isPanelExpanded ? 860 : 600, minWidth: 480 }}
          >
            <Editor onClose={handleEditorClose} />
          </div>
        </div>
      )}

      <CreateModal
        open={showModal}
        onClose={() => {}}
        onCreate={handleCreate}
      />
    </>
  )
}
