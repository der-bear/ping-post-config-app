import { useCallback } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import {
  PanelLayout,
  PanelHeader,
  PanelFooter,
  PanelSidebar,
  NavItem,
  NavGroup,
} from '@/components/panel-layout'
import { Button } from '@/components/ui/button'
import { GeneralSettings } from './general-settings'
import { UrlEndpointSettings } from './url-endpoint-settings'
import { AuthenticationSettings } from './authentication-settings'
import { MappingsSettings } from './mappings-settings'
import { RequestBodySettings } from './request-body-settings'
import { ResponseSettings } from './response-settings'
import { RetrySettings } from './retry-settings'
import { PortalPermissions } from './portal-permissions'
import { DeliverySchedule } from './delivery-schedule'
import { NotificationsSettings } from './notifications-settings'
import { AddMappingPanel } from './add-mapping-panel'
import type { ActivePanel, PingPostTab } from '@/features/delivery-method/types'

const PING_POST_TABS: { tab: PingPostTab; label: string }[] = [
  { tab: 'url-endpoint', label: 'URL Endpoint' },
  { tab: 'authentication', label: 'Authentication' },
  { tab: 'mappings', label: 'Mappings' },
  { tab: 'request-body', label: 'Request Body' },
  { tab: 'response-settings', label: 'Response Settings' },
  { tab: 'retry-settings', label: 'Retry Settings' },
]

function getPanelTitle(panel: ActivePanel): string {
  if (panel.section === 'general') return 'Delivery Method Detail'
  if (panel.section === 'portal-permissions') return 'Portal Permissions'
  if (panel.section === 'delivery-schedule') return 'Delivery Schedule'
  if (panel.section === 'notifications') return 'Notifications'

  const phase = panel.section === 'ping' ? 'PING' : 'POST'
  const tabLabels: Record<PingPostTab, string> = {
    'url-endpoint': 'URL Endpoint',
    authentication: 'Authentication',
    mappings: 'Mappings',
    'request-body': 'Request Body',
    'response-settings': 'Response Settings',
    'retry-settings': 'Retry Settings',
  }

  return `${tabLabels[panel.tab]} (${phase})`
}

function isTabActive(
  activePanel: ActivePanel,
  section: 'ping' | 'post',
  tab: PingPostTab,
): boolean {
  if (activePanel.section !== section) return false
  return 'tab' in activePanel && activePanel.tab === tab
}

function isSectionActive(
  activePanel: ActivePanel,
  section: ActivePanel['section'],
): boolean {
  return activePanel.section === section
}

export function DeliveryMethodEditor() {
  const activePanel = useDeliveryMethodStore((s) => s.activePanel)
  const setActivePanel = useDeliveryMethodStore((s) => s.setActivePanel)
  const isPingExpanded = useDeliveryMethodStore((s) => s.isPingExpanded)
  const isPostExpanded = useDeliveryMethodStore((s) => s.isPostExpanded)
  const isPanelExpanded = useDeliveryMethodStore((s) => s.isPanelExpanded)
  const togglePingExpanded = useDeliveryMethodStore((s) => s.togglePingExpanded)
  const togglePostExpanded = useDeliveryMethodStore((s) => s.togglePostExpanded)
  const togglePanelExpanded = useDeliveryMethodStore((s) => s.togglePanelExpanded)

  const title = getPanelTitle(activePanel)

  const handleNavClick = useCallback(
    (panel: ActivePanel) => {
      setActivePanel(panel)
    },
    [setActivePanel],
  )

  const isPingGroupActive = activePanel.section === 'ping'
  const isPostGroupActive = activePanel.section === 'post'

  const renderContent = () => {
    switch (activePanel.section) {
      case 'general':
        return <GeneralSettings />
      case 'portal-permissions':
        return <PortalPermissions />
      case 'delivery-schedule':
        return <DeliverySchedule />
      case 'notifications':
        return <NotificationsSettings />
      case 'ping':
      case 'post': {
        const phase = activePanel.section
        const tab = activePanel.tab
        switch (tab) {
          case 'url-endpoint':
            return <UrlEndpointSettings phase={phase} />
          case 'authentication':
            return <AuthenticationSettings phase={phase} />
          case 'mappings':
            return <MappingsSettings phase={phase} />
          case 'request-body':
            return <RequestBodySettings phase={phase} />
          case 'response-settings':
            return <ResponseSettings phase={phase} />
          case 'retry-settings':
            return <RetrySettings phase={phase} />
          default:
            return null
        }
      }
      default:
        return null
    }
  }

  return (
    <div className="h-full">
      <PanelLayout
        sidebar={
          <PanelSidebar>
            <NavItem
              label="General"
              active={isSectionActive(activePanel, 'general')}
              onClick={() => handleNavClick({ section: 'general' })}
            />

            <NavGroup
              label="PING Configuration"
              expanded={isPingExpanded}
              onToggle={togglePingExpanded}
              active={isPingGroupActive}
            >
              {PING_POST_TABS.map(({ tab, label }) => (
                <NavItem
                  key={`ping-${tab}`}
                  label={label}
                  active={isTabActive(activePanel, 'ping', tab)}
                  onClick={() =>
                    handleNavClick({ section: 'ping', tab })
                  }
                  indented
                />
              ))}
            </NavGroup>

            <NavGroup
              label="POST Configuration"
              expanded={isPostExpanded}
              onToggle={togglePostExpanded}
              active={isPostGroupActive}
            >
              {PING_POST_TABS.map(({ tab, label }) => (
                <NavItem
                  key={`post-${tab}`}
                  label={label}
                  active={isTabActive(activePanel, 'post', tab)}
                  onClick={() =>
                    handleNavClick({ section: 'post', tab })
                  }
                  indented
                />
              ))}
            </NavGroup>

            <NavItem
              label="Portal Permissions"
              active={isSectionActive(activePanel, 'portal-permissions')}
              onClick={() =>
                handleNavClick({ section: 'portal-permissions' })
              }
            />

            <NavItem
              label="Delivery Schedule"
              active={isSectionActive(activePanel, 'delivery-schedule')}
              onClick={() =>
                handleNavClick({ section: 'delivery-schedule' })
              }
            />

            <NavItem
              label="Notifications"
              active={isSectionActive(activePanel, 'notifications')}
              onClick={() =>
                handleNavClick({ section: 'notifications' })
              }
            />
          </PanelSidebar>
        }
        header={
          <PanelHeader
            title={title}
            isExpanded={isPanelExpanded}
            onMaximize={togglePanelExpanded}
            onClose={() => {}}
          />
        }
        footer={
          <PanelFooter
            leftActions={
              <>
                <Button variant="secondary" size="sm">
                  Generate Request
                </Button>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
              </>
            }
            rightActions={
              <>
                <Button variant="secondary" size="sm">
                  Close
                </Button>
                <Button size="sm">Save</Button>
              </>
            }
          />
        }
      >
        {renderContent()}
      </PanelLayout>

      <AddMappingPanel />
    </div>
  )
}
