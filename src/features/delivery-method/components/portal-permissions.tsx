import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup } from '@/components/field-group'
import { YesNoSelect } from '@/components/ui/yes-no-select'

export function PortalPermissions() {
  const permissions = useDeliveryMethodStore((s) => s.config.portalPermissions)
  const updatePortalPermissions = useDeliveryMethodStore(
    (s) => s.updatePortalPermissions,
  )

  return (
    <div className="space-y-5">
      <FieldGroup label="Show IVR Call Information">
        <YesNoSelect
          value={permissions.showIvrCallInformation}
          onValueChange={(v) => updatePortalPermissions({ showIvrCallInformation: v })}
        />
      </FieldGroup>

      <FieldGroup label="Show File Attachments">
        <YesNoSelect
          value={permissions.showFileAttachments}
          onValueChange={(v) => updatePortalPermissions({ showFileAttachments: v })}
        />
      </FieldGroup>

      <FieldGroup label="Show Website Analytics Data">
        <YesNoSelect
          value={permissions.showWebsiteAnalyticsData}
          onValueChange={(v) => updatePortalPermissions({ showWebsiteAnalyticsData: v })}
        />
      </FieldGroup>
    </div>
  )
}
