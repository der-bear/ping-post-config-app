import { useState, useEffect, useCallback, useRef } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogPanelHeader,
} from '@/components/ui/dialog'
import { FieldGroup, SectionHeading } from '@/components/ui/field-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { Plus, Trash2 } from 'lucide-react'
import { LEAD_FIELDS, LEAD_FIELD_CATEGORIES } from '@/data/lead-fields'
import type { FieldMapping, ValueMapping } from '@/features/delivery-method/types'
import { cn } from '@/lib/utils'

// Lead field items for combobox — { value, label } structure for @base-ui auto-detection
type LeadFieldOption = { value: string; label: string }

// Group lead fields by category — nested structure for @base-ui grouped combobox
const leadFieldGroups = LEAD_FIELD_CATEGORIES.map((cat) => ({
  value: cat.id,
  label: cat.label,
  items: LEAD_FIELDS.filter((f) => f.category === cat.id).map((f) => ({
    value: f.name,
    label: f.label,
  })),
}))

// Flat list for value lookup
const allLeadFieldOptions: LeadFieldOption[] = LEAD_FIELDS.map((f) => ({ value: f.name, label: f.label }))

export function AddMappingPanel() {
  const flyoutOpen = useDeliveryMethodStore((s) => s.flyoutOpen)
  const flyoutData = useDeliveryMethodStore((s) => s.flyoutData)
  const flyoutContext = useDeliveryMethodStore((s) => s.flyoutContext)
  const closeFlyout = useDeliveryMethodStore((s) => s.closeFlyout)
  const addPingMapping = useDeliveryMethodStore((s) => s.addPingMapping)
  const addPostMapping = useDeliveryMethodStore((s) => s.addPostMapping)
  const updatePingMapping = useDeliveryMethodStore((s) => s.updatePingMapping)
  const updatePostMapping = useDeliveryMethodStore((s) => s.updatePostMapping)

  const isEditing = flyoutData !== null
  const phase = flyoutContext

  const formRef = useRef<HTMLFormElement>(null)

  // Only interactive controls need state (Select, Switch, dynamic list)
  const [leadField, setLeadField] = useState('')
  const [useInPost, setUseInPost] = useState(false)
  const [hasValueMappings, setHasValueMappings] = useState(false)
  const [valueMappings, setValueMappings] = useState<ValueMapping[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [vmErrors, setVmErrors] = useState<Record<string, { source?: boolean; target?: boolean }>>({})

  // Increment to force form remount (resets uncontrolled inputs)
  const [formKey, setFormKey] = useState(0)

   
  useEffect(() => {
    if (flyoutOpen) {
      setFormKey((k) => k + 1) // eslint-disable-line react-hooks/set-state-in-effect
      setErrors({})
      setVmErrors({})
      if (flyoutData) {
        setLeadField(flyoutData.mappedTo)
        setUseInPost(flyoutData.useInPost)
        setHasValueMappings(flyoutData.hasValueMappings)
        setValueMappings(flyoutData.valueMappings)
      } else {
        setLeadField('')
        setUseInPost(false)
        setHasValueMappings(false)
        setValueMappings([])
      }
    }
  }, [flyoutOpen, flyoutData])

  const handleAddValueMapping = useCallback(() => {
    setValueMappings((prev) => [
      ...prev,
      { id: `vm-${Date.now()}`, sourceValue: '', targetValue: '' },
    ])
  }, [])

  const handleRemoveValueMapping = useCallback((id: string) => {
    setValueMappings((prev) => prev.filter((vm) => vm.id !== id))
  }, [])

  const handleSave = useCallback(() => {
    const form = formRef.current
    if (!form) return

    const fd = new FormData(form)
    const name = (fd.get('name') as string)?.trim() ?? ''
    const defaultValue = (fd.get('defaultValue') as string) ?? ''
    const testValue = (fd.get('testValue') as string) ?? ''

    // Validate
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = 'Enter field name'
    if (!leadField) newErrors.leadField = 'Select lead field'

    // Read value mapping values from form
    const vmData: ValueMapping[] = valueMappings.map((vm) => ({
      id: vm.id,
      sourceValue: ((fd.get(`vm-source-${vm.id}`) as string) ?? '').trim(),
      targetValue: ((fd.get(`vm-target-${vm.id}`) as string) ?? '').trim(),
    }))

    // Validate value mappings if enabled
    const newVmErrors: Record<string, { source?: boolean; target?: boolean }> = {}
    if (hasValueMappings && valueMappings.length > 0) {
      vmData.forEach((vm) => {
        const vmError: { source?: boolean; target?: boolean } = {}
        if (!vm.sourceValue) vmError.source = true
        if (!vm.targetValue) vmError.target = true
        if (vmError.source || vmError.target) {
          newVmErrors[vm.id] = vmError
        }
      })
      if (Object.keys(newVmErrors).length > 0) {
        newErrors.valueMappings = 'Enter both source and target for all mappings'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setVmErrors(newVmErrors)
      return
    }

    const mapping: FieldMapping = {
      id: isEditing && flyoutData ? flyoutData.id : `mapping-${Date.now()}`,
      type: 'Lead Field',
      name,
      mappedTo: leadField,
      defaultValue,
      testValue,
      useInPost,
      hasValueMappings,
      valueMappings: hasValueMappings ? vmData : [],
    }

    if (isEditing) {
      if (phase === 'ping') {
        updatePingMapping(flyoutData.id, mapping)
      } else {
        updatePostMapping(flyoutData.id, mapping)
      }
    } else {
      if (phase === 'ping') {
        addPingMapping(mapping)
      } else {
        addPostMapping(mapping)
      }
    }

    closeFlyout()
  }, [
    isEditing,
    flyoutData,
    leadField,
    useInPost,
    hasValueMappings,
    valueMappings,
    phase,
    addPingMapping,
    addPostMapping,
    updatePingMapping,
    updatePostMapping,
    closeFlyout,
  ])

  return (
    <Dialog open={flyoutOpen} onOpenChange={(open) => !open && closeFlyout()}>
      <DialogContent
        className="max-w-md p-0 gap-0 overflow-hidden shadow-panel"
        showClose={false}
      >
        <DialogPanelHeader title={isEditing ? 'Edit Field Mapping' : 'Lead Field Mapping'} />
        <DialogDescription className="sr-only">
          {isEditing ? 'Edit an existing field mapping' : 'Add a new field mapping'}
        </DialogDescription>

        {/* Content — form key forces remount to reset uncontrolled inputs */}
        <form
          ref={formRef}
          key={formKey}
          className="p-5 max-h-[70vh] overflow-y-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-5">
            <FieldGroup label="Delivery Field Name" required>
              <Input
                name="name"
                defaultValue={flyoutData?.name ?? ''}
                placeholder="e.g. first_name"
                className={cn(errors.name && 'border-destructive')}
                onChange={() => errors.name && setErrors((prev) => ({ ...prev, name: '' }))}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </FieldGroup>

            <FieldGroup label="Lead Field" required>
              <Combobox
                items={leadFieldGroups}
                value={leadField ? allLeadFieldOptions.find((f) => f.value === leadField) ?? null : null}
                onValueChange={(item: LeadFieldOption | null) => {
                  setLeadField(item?.value ?? '')
                  if (errors.leadField) setErrors((prev) => ({ ...prev, leadField: '' }))
                }}
              >
                <ComboboxInput
                  placeholder="Search lead fields..."
                  className={cn(errors.leadField && 'border-destructive')}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No lead field found.</ComboboxEmpty>
                  <ComboboxList>
                    {(group) => (
                      <ComboboxGroup key={group.value} items={group.items}>
                        <ComboboxLabel>{group.label}</ComboboxLabel>
                        <ComboboxCollection>
                          {(field: LeadFieldOption) => (
                            <ComboboxItem key={field.value} value={field}>
                              {field.label}
                            </ComboboxItem>
                          )}
                        </ComboboxCollection>
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.leadField && (
                <p className="text-xs text-destructive mt-1">{errors.leadField}</p>
              )}
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Default Value (If Blank)">
                <Input
                  name="defaultValue"
                  defaultValue={flyoutData?.defaultValue ?? ''}
                  placeholder="Default value"
                />
              </FieldGroup>
              <FieldGroup label="Test Value">
                <Input
                  name="testValue"
                  defaultValue={flyoutData?.testValue ?? ''}
                  placeholder="Test value"
                />
              </FieldGroup>
            </div>

            {phase === 'ping' && (
              <>
                <Separator />
                <label className="flex gap-4 items-start cursor-pointer">
                  <Switch checked={useInPost} onCheckedChange={setUseInPost} />
                  <div className="space-y-0.5">
                    <span className="text-sm font-normal">Use also in POST</span>
                    <p className="text-xs text-muted-foreground">
                      Automatically add the field mapping into the POST configuration.
                    </p>
                  </div>
                </label>
              </>
            )}

            <Separator />

            <SectionHeading title="Value Mapping" />

            <label className="flex gap-4 items-start cursor-pointer">
              <Switch
                checked={hasValueMappings}
                onCheckedChange={setHasValueMappings}
              />
              <div className="space-y-0.5">
                <span className="text-sm font-normal">Has Value Mappings</span>
                <p className="text-xs text-muted-foreground">
                  Value maps allow you to change the outgoing value.
                </p>
              </div>
            </label>

            {hasValueMappings && (
              <>
                <Separator />

                <div className="flex items-center justify-between">
                  <SectionHeading title="Value Mappings" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={handleAddValueMapping}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-[10px] text-xs font-semibold text-foreground">
                        Source Value
                      </th>
                      <th className="text-left px-3 py-[10px] text-xs font-semibold text-foreground">
                        Target Value
                      </th>
                      <th className="w-9" />
                    </tr>
                  </thead>
                  <tbody>
                    {valueMappings.map((vm) => (
                      <tr key={vm.id} className="border-b border-border group">
                        <td className="px-1 py-1">
                          <input
                            name={`vm-source-${vm.id}`}
                            defaultValue={vm.sourceValue}
                            placeholder="Enter value"
                            className={cn(
                              "w-full h-8 px-2 text-xs text-foreground bg-transparent rounded-[4px] border focus:outline-none placeholder:text-muted-foreground",
                              vmErrors[vm.id]?.source
                                ? "border-destructive focus:border-destructive"
                                : "border-transparent focus:border-primary"
                            )}
                            onChange={() => {
                              if (vmErrors[vm.id]?.source) {
                                setVmErrors((prev) => {
                                  const next = { ...prev }
                                  if (next[vm.id]) {
                                    const { source, ...rest } = next[vm.id]
                                    if (Object.keys(rest).length === 0) {
                                      delete next[vm.id]
                                    } else {
                                      next[vm.id] = rest
                                    }
                                  }
                                  return next
                                })
                                setErrors((prev) => ({ ...prev, valueMappings: '' }))
                              }
                            }}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            name={`vm-target-${vm.id}`}
                            defaultValue={vm.targetValue}
                            placeholder="Enter value"
                            className={cn(
                              "w-full h-8 px-2 text-xs text-foreground bg-transparent rounded-[4px] border focus:outline-none placeholder:text-muted-foreground",
                              vmErrors[vm.id]?.target
                                ? "border-destructive focus:border-destructive"
                                : "border-transparent focus:border-primary"
                            )}
                            onChange={() => {
                              if (vmErrors[vm.id]?.target) {
                                setVmErrors((prev) => {
                                  const next = { ...prev }
                                  if (next[vm.id]) {
                                    const { target, ...rest } = next[vm.id]
                                    if (Object.keys(rest).length === 0) {
                                      delete next[vm.id]
                                    } else {
                                      next[vm.id] = rest
                                    }
                                  }
                                  return next
                                })
                                setErrors((prev) => ({ ...prev, valueMappings: '' }))
                              }
                            }}
                          />
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            className="flex items-center justify-center h-7 w-7 rounded-[4px] text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-accent transition-opacity duration-75"
                            onClick={() => handleRemoveValueMapping(vm.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {valueMappings.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-xs text-muted-foreground">
                          No value mappings. Click Add to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {errors.valueMappings && (
                  <p className="text-xs text-destructive mt-2">{errors.valueMappings}</p>
                )}
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="px-5 py-4 border-t border-border">
          <Button variant="secondary" onClick={closeFlyout}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
