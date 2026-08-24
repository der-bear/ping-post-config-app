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
import type { ClientConfiguration, DeliveryAccountSection } from '../../types'
import { AdvancedPanel } from './advanced-panel'
import { CriteriaPanel } from './criteria-panel'
import { DeliveryPanel } from './delivery-panel'
import { GeneralPanel } from './general-panel'
import { OfferPanel } from './offer-panel'
import { QuantityLimitsPanel } from './quantity-limits-panel'
import { RevenuePanel } from './revenue-panel'

type DeliveryAccount = ClientConfiguration['deliveryAccount']

interface DeliveryAccountEditorProps {
  initialSection?: DeliveryAccountSection
  onClose: () => void
}

const tabs: Array<{ section: DeliveryAccountSection; label: string }> = [
  { section: 'general', label: 'General' },
  { section: 'quantity-limits', label: 'Quantity Limits' },
  { section: 'delivery', label: 'Delivery' },
  { section: 'revenue', label: 'Revenue' },
  { section: 'criteria', label: 'Criteria' },
  { section: 'offer', label: 'Offer' },
  { section: 'advanced', label: 'Advanced' },
]

const panelTitles: Record<DeliveryAccountSection, string> = {
  general: 'General',
  'quantity-limits': 'Quantity Limits',
  delivery: 'Delivery',
  revenue: 'Revenue',
  criteria: 'Criteria',
  offer: 'Offer',
  advanced: 'Advanced',
}

function comparableAccount(account: DeliveryAccount) {
  return JSON.stringify({ ...account, criteria: [] })
}

export function DeliveryAccountEditor({
  initialSection = 'general',
  onClose,
}: DeliveryAccountEditorProps) {
  const { toast } = useToast()
  const storedAccount = useClientConfigurationStore((state) => state.config.deliveryAccount)
  const activeSection = useClientConfigurationStore((state) => state.activeDeliveryAccountSection)
  const setActiveSection = useClientConfigurationStore((state) => state.setActiveDeliveryAccountSection)
  const isPanelExpanded = useClientConfigurationStore((state) => state.isPanelExpanded)
  const togglePanelExpanded = useClientConfigurationStore((state) => state.togglePanelExpanded)
  const updateDeliveryAccount = useClientConfigurationStore((state) => state.updateDeliveryAccount)

  const [draft, setDraft] = useState<DeliveryAccount>(storedAccount)
  const [isSaving, setIsSaving] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection, setActiveSection])

  const isDirty = useMemo(
    () => comparableAccount(draft) !== comparableAccount(storedAccount),
    [draft, storedAccount],
  )

  const updateDraft = (partial: Partial<DeliveryAccount>) => {
    setDraft((current) => ({ ...current, ...partial }))
  }

  const handleSave = async (closeAfterSave = false) => {
    if (!draft.name.trim()) {
      setActiveSection('general')
      toast({
        variant: 'destructive',
        title: 'Delivery Account Name is required',
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    updateDeliveryAccount(draft)
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

  const renderPanel = () => {
    switch (activeSection) {
      case 'general':
        return <GeneralPanel value={draft} onChange={updateDraft} />
      case 'quantity-limits':
        return (
          <QuantityLimitsPanel
            value={draft.quantityLimits}
            onChange={(partial) =>
              updateDraft({ quantityLimits: { ...draft.quantityLimits, ...partial } })
            }
          />
        )
      case 'delivery':
        return (
          <DeliveryPanel
            value={draft.delivery}
            onChange={(partial) => updateDraft({ delivery: { ...draft.delivery, ...partial } })}
          />
        )
      case 'revenue':
        return (
          <RevenuePanel
            value={draft.revenue}
            onChange={(partial) => updateDraft({ revenue: { ...draft.revenue, ...partial } })}
          />
        )
      case 'criteria':
        return <CriteriaPanel />
      case 'offer':
        return (
          <OfferPanel
            value={draft.offer}
            onChange={(partial) => updateDraft({ offer: { ...draft.offer, ...partial } })}
          />
        )
      case 'advanced':
        return (
          <AdvancedPanel
            value={draft.advanced}
            onChange={(partial) => updateDraft({ advanced: { ...draft.advanced, ...partial } })}
          />
        )
    }
  }

  return (
    <>
      <PanelLayout
        sidebar={
          <PanelSidebar>
            {tabs.map((tab) => (
              <NavItem
                key={tab.section}
                label={tab.label}
                active={activeSection === tab.section}
                onClick={() => setActiveSection(tab.section)}
              />
            ))}
          </PanelSidebar>
        }
        header={
          <PanelHeader
            subtitle="Delivery Account"
            title={panelTitles[activeSection]}
            isExpanded={isPanelExpanded}
            onMaximize={togglePanelExpanded}
            onClose={handleClose}
          />
        }
        footer={
          <PanelFooter
            leftActions={
              <p className="text-xs text-muted-foreground">
                {activeSection === 'criteria' ? 'Criteria changes save automatically' : 'Save changes before closing'}
              </p>
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
        {renderPanel()}
        <SavingOverlay open={isSaving} message="Saving..." />
      </PanelLayout>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        isSaving={isSaving}
        onCancel={() => setUnsavedDialogOpen(false)}
        onDiscard={() => {
          setDraft(storedAccount)
          setUnsavedDialogOpen(false)
          onClose()
        }}
        onSave={() => handleSave(true)}
      />
    </>
  )
}
