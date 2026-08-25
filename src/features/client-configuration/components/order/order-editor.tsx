import { useEffect, useMemo, useState } from 'react'

import { Button, SavingOverlay, UnsavedChangesDialog } from '@/components/ui'
import {
  NavItem,
  PanelFooter,
  PanelHeader,
  PanelLayout,
  PanelSidebar,
} from '@/components/panel-layout'
import { useToast } from '@/components/ui/use-toast'

import { useClientConfigurationStore } from '../../store'
import type { ClientConfiguration, OrderSection } from '../../types'
import { OrderGeneralPanel } from './order-general-panel'
import { OrderItemsPanel } from './order-items-panel'
import { OrderPaymentsPanel } from './order-payments-panel'

type Order = ClientConfiguration['order']

interface OrderEditorProps {
  initialSection?: OrderSection
  onClose: () => void
}

function comparableOrder(order: Order) {
  return JSON.stringify({ ...order, items: [] })
}

export function OrderEditor({ initialSection = 'general', onClose }: OrderEditorProps) {
  const { toast } = useToast()
  const storedOrder = useClientConfigurationStore((state) => state.config.order)
  const activeSection = useClientConfigurationStore((state) => state.activeOrderSection)
  const setActiveSection = useClientConfigurationStore((state) => state.setActiveOrderSection)
  const isPanelExpanded = useClientConfigurationStore((state) => state.isPanelExpanded)
  const togglePanelExpanded = useClientConfigurationStore((state) => state.togglePanelExpanded)
  const updateOrder = useClientConfigurationStore((state) => state.updateOrder)

  const [draft, setDraft] = useState<Order>(storedOrder)
  const [isSaving, setIsSaving] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection, setActiveSection])

  const isDirty = useMemo(
    () => comparableOrder(draft) !== comparableOrder(storedOrder),
    [draft, storedOrder],
  )

  const handleSave = async (closeAfterSave = false) => {
    if (!draft.name.trim()) {
      setActiveSection('general')
      toast({ variant: 'destructive', title: 'Order Name is required' })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    updateOrder({
      name: draft.name,
      leadType: draft.leadType,
      description: draft.description,
      status: draft.status,
      startDate: draft.startDate,
      endDate: draft.endDate,
      renewOrder: draft.renewOrder,
      autoCharge: draft.autoCharge,
      autoChargeTiming: draft.autoChargeTiming,
      paymentDiscount: draft.paymentDiscount,
      maxReturnPercentageEnabled: draft.maxReturnPercentageEnabled,
      maxReturnPercentage: draft.maxReturnPercentage,
    })
    setIsSaving(false)
    setUnsavedDialogOpen(false)
    toast({ variant: 'success', title: 'Changes saved successfully' })
    if (closeAfterSave) onClose()
  }

  const handleClose = () => {
    if (isDirty) {
      setUnsavedDialogOpen(true)
      return
    }
    onClose()
  }

  return (
    <>
      <PanelLayout
        sidebar={
          <PanelSidebar>
            <NavItem
              label="General"
              active={activeSection === 'general'}
              onClick={() => setActiveSection('general')}
            />
            <NavItem
              label="Items"
              active={activeSection === 'items'}
              onClick={() => setActiveSection('items')}
            />
            <NavItem
              label="Payments"
              active={activeSection === 'payments'}
              onClick={() => setActiveSection('payments')}
            />
          </PanelSidebar>
        }
        header={
          <PanelHeader
            subtitle="Order"
            title={
              activeSection === 'general'
                ? 'General Options'
                : activeSection === 'items'
                  ? 'Items'
                  : 'Payments'
            }
            isExpanded={isPanelExpanded}
            onMaximize={togglePanelExpanded}
            onClose={handleClose}
          />
        }
        footer={
          <PanelFooter
            leftActions={
              <Button size="sm">Transaction History</Button>
            }
            rightActions={
              <>
                <Button variant="outline" size="sm" onClick={handleClose}>Close</Button>
                <Button variant="success" size="sm" onClick={() => handleSave(false)}>Save</Button>
              </>
            }
          />
        }
      >
        {activeSection === 'general' ? (
          <OrderGeneralPanel
            value={draft}
            onChange={(partial) => setDraft((current) => ({ ...current, ...partial }))}
          />
        ) : activeSection === 'items' ? (
          <OrderItemsPanel />
        ) : (
          <OrderPaymentsPanel />
        )}
        <SavingOverlay open={isSaving} message="Saving..." />
      </PanelLayout>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        isSaving={isSaving}
        onCancel={() => setUnsavedDialogOpen(false)}
        onDiscard={() => {
          setDraft(storedOrder)
          setUnsavedDialogOpen(false)
          onClose()
        }}
        onSave={() => handleSave(true)}
      />
    </>
  )
}
