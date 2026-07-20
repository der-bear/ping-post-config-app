import { useCallback, useState } from 'react'
import { useCampaignStore } from '../store'
import type { ActivePanel, CampaignSection } from '../types'

import { PanelLayout } from '@/components/panel-layout/panel-layout'
import { PanelSidebar, NavItem, NavGroup } from '@/components/panel-layout/panel-sidebar'
import { PanelHeader } from '@/components/panel-layout/panel-header'
import { PanelFooter } from '@/components/panel-layout/panel-footer'
import { Button } from '@/components/ui/button'
import { SavingOverlay } from '@/components/ui/saving-overlay'
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { ExternalLink } from 'lucide-react'

import { GeneralSettings } from './general-settings'
import { DeliveryOptions } from './delivery-options'
import { DuplicateChecks } from './duplicate-checks'
import { CriteriaSettings } from './criteria-settings'
import { QuantityLimits } from './quantity-limits'
import { LeadValidation } from './lead-validation'
import { ComplianceSettings } from './compliance-settings'
import { IntegrationsManage } from './integrations-manage'
import { IntegrationCriteria } from './integration-criteria'
import { AgentForms } from './agent-forms'
import { PostbackSettings } from './postback-settings'

// ---- Quality Control sub-tabs ----
const QC_TABS: { section: CampaignSection; label: string }[] = [
  { section: 'duplicate-checks', label: 'Duplicate Checks' },
  { section: 'criteria', label: 'Criteria' },
  { section: 'quantity-limits', label: 'Quantity Limits' },
  { section: 'lead-validation', label: 'Lead Validation' },
  { section: 'compliance', label: 'Compliance' },
]

const INTEGRATIONS_TABS: { section: CampaignSection; label: string }[] = [
  { section: 'integrations-manage', label: 'Manage' },
  { section: 'integration-criteria', label: 'Integration Criteria' },
]

const POSTBACK_TABS: { section: CampaignSection; label: string }[] = [
  { section: 'postback-configuration', label: 'Configuration' },
  { section: 'postback-history', label: 'History' },
]

// ---- Title Map ----
const PANEL_TITLES: Record<CampaignSection, string> = {
  'general': 'General Settings',
  'delivery-options': 'Delivery Options',
  'duplicate-checks': 'Duplicate Check Settings',
  'criteria': 'Campaign Criteria',
  'quantity-limits': 'Quantity Limits',
  'lead-validation': 'Lead Validation',
  'compliance': 'Compliance',
  'integrations-manage': 'Campaign Integrations',
  'integration-criteria': 'Campaign Integration Criteria',
  'agent-forms': 'Inbound Agent Forms',
  'postback-configuration': 'Postback Configuration',
  'postback-history': 'Postback History',
}

type CampaignEditorErrors = {
  campaignName?: string
}

interface CampaignEditorProps {
  onClose?: () => void
}

export function CampaignEditor({ onClose }: CampaignEditorProps) {
  const { toast } = useToast()

  // Store subscriptions
  const activePanel = useCampaignStore((s) => s.activePanel)
  const setActivePanel = useCampaignStore((s) => s.setActivePanel)
  const isQualityControlExpanded = useCampaignStore((s) => s.isQualityControlExpanded)
  const isIntegrationsExpanded = useCampaignStore((s) => s.isIntegrationsExpanded)
  const isPostbackExpanded = useCampaignStore((s) => s.isPostbackExpanded)
  const isPanelExpanded = useCampaignStore((s) => s.isPanelExpanded)
  const toggleQualityControlExpanded = useCampaignStore((s) => s.toggleQualityControlExpanded)
  const toggleIntegrationsExpanded = useCampaignStore((s) => s.toggleIntegrationsExpanded)
  const togglePostbackExpanded = useCampaignStore((s) => s.togglePostbackExpanded)
  const togglePanelExpanded = useCampaignStore((s) => s.togglePanelExpanded)
  const config = useCampaignStore((s) => s.config)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false)
  const [errors, setErrors] = useState<CampaignEditorErrors>({})
  const { hasUnsavedChanges, markSaved } = useUnsavedChanges(config)

  // Navigation helpers
  const isActive = (section: CampaignSection) => activePanel.section === section
  const isQcActive = QC_TABS.some((t) => activePanel.section === t.section)
  const isIntActive = INTEGRATIONS_TABS.some((t) => activePanel.section === t.section)
  const isPostbackActive = POSTBACK_TABS.some((t) => activePanel.section === t.section)

  const nav = (section: CampaignSection) => () =>
    setActivePanel({ section } as ActivePanel)

  const validateCampaignName = useCallback((value = config.general.name) => {
    const error = value.trim() ? undefined : 'Campaign Name is required.'

    setErrors((current) => {
      const next = { ...current }
      if (error) {
        next.campaignName = error
      } else {
        delete next.campaignName
      }
      return next
    })

    return !error
  }, [config.general.name])

  const clearCampaignNameError = useCallback(() => {
    setErrors((current) => {
      if (!current.campaignName) return current

      const next = { ...current }
      delete next.campaignName
      return next
    })
  }, [])

  // Save handler
  const handleSave = useCallback(async (closeAfterSave = false) => {
    if (!validateCampaignName()) {
      setActivePanel({ section: 'general' })
      setUnsavedDialogOpen(false)
      return
    }

    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      markSaved()
      setUnsavedDialogOpen(false)
      toast({ variant: 'success', title: 'Changes saved successfully' })
      if (closeAfterSave) onClose?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save changes',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setIsSaving(false)
    }
  }, [markSaved, onClose, setActivePanel, toast, validateCampaignName])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setUnsavedDialogOpen(true)
    } else {
      onClose?.()
    }
  }

  // Render content
  const renderContent = () => {
    switch (activePanel.section) {
      case 'general':
        return (
          <GeneralSettings
            campaignNameError={errors.campaignName}
            onCampaignNameBlur={validateCampaignName}
            onCampaignNameChange={clearCampaignNameError}
          />
        )
      case 'delivery-options':
        return <DeliveryOptions />
      case 'duplicate-checks':
        return <DuplicateChecks />
      case 'criteria':
        return <CriteriaSettings />
      case 'quantity-limits':
        return <QuantityLimits />
      case 'lead-validation':
        return <LeadValidation />
      case 'compliance':
        return <ComplianceSettings />
      case 'integrations-manage':
        return <IntegrationsManage />
      case 'integration-criteria':
        return <IntegrationCriteria />
      case 'agent-forms':
        return <AgentForms />
      case 'postback-configuration':
      case 'postback-history':
        return <PostbackSettings />
      default:
        return null
    }
  }

  return (
    <>
      <PanelLayout
        sidebar={
          <PanelSidebar>
            <NavItem
              label="General"
              active={isActive('general')}
              invalid={Boolean(errors.campaignName)}
              onClick={nav('general')}
            />
            <NavItem label="Delivery Options" active={isActive('delivery-options')} onClick={nav('delivery-options')} />

            <NavGroup
              label="Quality Control"
              expanded={isQualityControlExpanded}
              onToggle={toggleQualityControlExpanded}
              active={isQcActive}
            >
              {QC_TABS.map(({ section, label }) => (
                <NavItem
                  key={section}
                  label={label}
                  active={isActive(section)}
                  onClick={nav(section)}
                  indented
                />
              ))}
            </NavGroup>

            <NavGroup
              label="Integrations"
              expanded={isIntegrationsExpanded}
              onToggle={toggleIntegrationsExpanded}
              active={isIntActive}
            >
              {INTEGRATIONS_TABS.map(({ section, label }) => (
                <NavItem
                  key={section}
                  label={label}
                  active={isActive(section)}
                  onClick={nav(section)}
                  indented
                />
              ))}
            </NavGroup>

            <NavGroup
              label="Postback"
              expanded={isPostbackExpanded}
              onToggle={togglePostbackExpanded}
              active={isPostbackActive}
            >
              {POSTBACK_TABS.map(({ section, label }) => (
                <NavItem
                  key={section}
                  label={label}
                  active={isActive(section)}
                  onClick={nav(section)}
                  indented
                />
              ))}
            </NavGroup>

            <NavItem label="Agent Forms" active={isActive('agent-forms')} onClick={nav('agent-forms')} />

            <button
              type="button"
              onClick={() => {}}
              className="w-full flex items-center justify-between pl-4 pr-3 py-3 text-sm leading-5 text-muted-foreground hover:bg-sidebar-hover border-t border-border transition-colors duration-75"
            >
              <span>Advanced Options</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </button>
          </PanelSidebar>
        }
        header={
          <PanelHeader
            subtitle="Campaign - Web"
            title={PANEL_TITLES[activePanel.section]}
            isExpanded={isPanelExpanded}
            onMaximize={togglePanelExpanded}
            onClose={handleClose}
          />
        }
        footer={
          <PanelFooter
            leftActions={
              <Button variant="outline" size="sm">Generate Posting Instructions</Button>
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
        {renderContent()}
        <SavingOverlay open={isSaving} message="Saving..." />
      </PanelLayout>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onSave={() => handleSave(true)}
        onDiscard={() => {
          setUnsavedDialogOpen(false)
          onClose?.()
        }}
        onCancel={() => setUnsavedDialogOpen(false)}
      />
    </>
  )
}
