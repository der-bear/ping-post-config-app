import { useState } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { FieldGroup, SectionHeading } from '@/components/field-group'
import { DebouncedInput } from '@/components/ui/debounced-input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import type { ResponseFormat } from '@/features/delivery-method/types'
import { validateRegex } from '@/lib/validation'
import { cn } from '@/lib/utils'

interface ResponseSettingsProps {
  phase: 'ping' | 'post'
}

export function ResponseSettings({ phase }: ResponseSettingsProps) {
  const isPing = phase === 'ping'

  const pingResponse = useDeliveryMethodStore((s) => s.config.ping.responseSettings)
  const postResponse = useDeliveryMethodStore((s) => s.config.post.responseSettings)
  const updatePingResponseSettings = useDeliveryMethodStore((s) => s.updatePingResponseSettings)
  const updatePostResponseSettings = useDeliveryMethodStore((s) => s.updatePostResponseSettings)

  const response = isPing ? pingResponse : postResponse
  const updateResponse = isPing ? updatePingResponseSettings : updatePostResponseSettings

  const isStructured = response.responseFormat === 'json' || response.responseFormat === 'xml'
  const isCustom = response.responseFormat === 'custom'

  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Response Format"
        description={`Select the format returned by the ${isPing ? 'ping' : 'post'} endpoint. This determines how the response is parsed.`}
      />

      <RadioGroup
        value={response.responseFormat}
        onValueChange={(value: ResponseFormat) =>
          updateResponse({ responseFormat: value })
        }
        className="flex gap-8"
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem value="json" />
          <span className="text-sm">JSON</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem value="xml" />
          <span className="text-sm">XML</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem value="custom" />
          <span className="text-sm">Custom</span>
        </label>
      </RadioGroup>

      <Separator />

      {/* ------------------------------------------------------------------ */}
      {/* Structured mode (JSON/XML)                                          */}
      {/* ------------------------------------------------------------------ */}
      {isStructured && (
        <>
          <SectionHeading
            title="Success Response"
            description={`Defines ${isPing ? 'ping' : 'post'} success by evaluating the response field (Key).`}
          />

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Key">
              <DebouncedInput
                value={response.successKey}
                onValueCommit={(v: string) => updateResponse({ successKey: v })}
                placeholder="e.g. status"
              />
            </FieldGroup>
            <FieldGroup label="Equal to the value">
              <DebouncedInput
                value={response.successValue}
                onValueCommit={(v: string) => updateResponse({ successValue: v })}
                placeholder="e.g. accepted"
              />
            </FieldGroup>
          </div>

          <Separator />

          {/* PING: Reference ID / POST: Price */}
          {isPing ? (
            <>
              <SectionHeading
                title="PING Reference ID"
                description="Response field (Key) containing the buyer's unique ping identifier."
              />
              <FieldGroup label="Key">
                <DebouncedInput
                  value={response.referenceIdKey}
                  onValueCommit={(v: string) => updateResponse({ referenceIdKey: v })}
                  placeholder="e.g. ref_id"
                />
              </FieldGroup>
            </>
          ) : (
            <>
              <SectionHeading
                title="Price"
                description="Response field (Key) containing the bid price."
              />
              <FieldGroup label="Key">
                <DebouncedInput
                  value={response.priceKey}
                  onValueCommit={(v: string) => updateResponse({ priceKey: v })}
                  placeholder="e.g. price"
                />
              </FieldGroup>
            </>
          )}

          <Separator />

          {/* PING: Bid Price / POST: Redirect URL */}
          {isPing ? (
            <>
              <SectionHeading
                title="Bid Price"
                description="Response field (Key) containing the bid price."
              />
              <FieldGroup label="Key">
                <DebouncedInput
                  value={response.priceKey}
                  onValueCommit={(v: string) => updateResponse({ priceKey: v })}
                  placeholder="e.g. bid_price"
                />
              </FieldGroup>
            </>
          ) : (
            <>
              <SectionHeading
                title="Redirect URL"
                description="Response field (Key) containing the redirect URL."
              />
              <FieldGroup label="Key">
                <DebouncedInput
                  value={postResponse.redirectUrlKey}
                  onValueCommit={(v: string) => updatePostResponseSettings({ redirectUrlKey: v })}
                  placeholder="e.g. redirect_url"
                />
              </FieldGroup>
            </>
          )}
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Custom/Text mode                                                    */}
      {/* ------------------------------------------------------------------ */}
      {isCustom && (
        <>
          <SectionHeading
            title="Success Response"
            description="Define the search pattern that indicates a successful response."
          />

          <FieldGroup label="Search Pattern">
            <DebouncedInput
              value={response.successSearchPattern}
              onValueCommit={(v: string) => updateResponse({ successSearchPattern: v })}
              onBlur={(e) => {
                // Only validate regex if "use regex" is checked
                if (response.successUseRegex) {
                  const error = validateRegex(e.target.value)
                  setErrors(prev => ({ ...prev, successSearchPattern: error }))
                }
              }}
              onChange={() => {
                if (errors.successSearchPattern) {
                  setErrors(prev => ({ ...prev, successSearchPattern: '' }))
                }
              }}
              placeholder="Enter search pattern"
              className={cn(errors.successSearchPattern && 'border-destructive')}
            />
            {errors.successSearchPattern && (
              <p className="text-xs text-destructive mt-1">{errors.successSearchPattern}</p>
            )}
          </FieldGroup>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={response.successUseRegex}
              onCheckedChange={(checked) => {
                updateResponse({ successUseRegex: checked === true })
                // Clear error when toggling regex off
                if (!checked && errors.successSearchPattern) {
                  setErrors(prev => ({ ...prev, successSearchPattern: '' }))
                }
              }}
            />
            <span className="text-sm">Use regular expression</span>
          </label>

          <Separator />

          {/* PING: Reference ID / POST: Price */}
          {isPing ? (
            <>
              <SectionHeading
                title="PING Reference ID"
                description="Define the search pattern to extract the reference ID."
              />
              <FieldGroup label="Search Pattern">
                <DebouncedInput
                  value={response.referenceIdSearchPattern}
                  onValueCommit={(v: string) => updateResponse({ referenceIdSearchPattern: v })}
                  onBlur={(e) => {
                    if (response.referenceIdUseRegex) {
                      const error = validateRegex(e.target.value)
                      setErrors(prev => ({ ...prev, referenceIdSearchPattern: error }))
                    }
                  }}
                  onChange={() => {
                    if (errors.referenceIdSearchPattern) {
                      setErrors(prev => ({ ...prev, referenceIdSearchPattern: '' }))
                    }
                  }}
                  placeholder="Enter search pattern"
                  className={cn(errors.referenceIdSearchPattern && 'border-destructive')}
                />
                {errors.referenceIdSearchPattern && (
                  <p className="text-xs text-destructive mt-1">{errors.referenceIdSearchPattern}</p>
                )}
              </FieldGroup>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={response.referenceIdUseRegex}
                  onCheckedChange={(checked) => {
                    updateResponse({ referenceIdUseRegex: checked === true })
                    if (!checked && errors.referenceIdSearchPattern) {
                      setErrors(prev => ({ ...prev, referenceIdSearchPattern: '' }))
                    }
                  }}
                />
                <span className="text-sm">Use regular expression</span>
              </label>
            </>
          ) : (
            <>
              <SectionHeading
                title="Price"
                description="Define the search pattern to extract the price."
              />
              <FieldGroup label="Search Pattern">
                <DebouncedInput
                  value={response.priceSearchPattern}
                  onValueCommit={(v: string) => updateResponse({ priceSearchPattern: v })}
                  onBlur={(e) => {
                    if (response.priceUseRegex) {
                      const error = validateRegex(e.target.value)
                      setErrors(prev => ({ ...prev, priceSearchPattern: error }))
                    }
                  }}
                  onChange={() => {
                    if (errors.priceSearchPattern) {
                      setErrors(prev => ({ ...prev, priceSearchPattern: '' }))
                    }
                  }}
                  placeholder="Enter search pattern"
                  className={cn(errors.priceSearchPattern && 'border-destructive')}
                />
                {errors.priceSearchPattern && (
                  <p className="text-xs text-destructive mt-1">{errors.priceSearchPattern}</p>
                )}
              </FieldGroup>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={response.priceUseRegex}
                  onCheckedChange={(checked) => {
                    updateResponse({ priceUseRegex: checked === true })
                    if (!checked && errors.priceSearchPattern) {
                      setErrors(prev => ({ ...prev, priceSearchPattern: '' }))
                    }
                  }}
                />
                <span className="text-sm">Use regular expression</span>
              </label>
            </>
          )}

          <Separator />

          {/* PING: Bid Price / POST: Redirect URL */}
          {isPing ? (
            <>
              <SectionHeading
                title="Bid Price"
                description="Define the search pattern to extract the bid price."
              />
              <FieldGroup label="Search Pattern">
                <DebouncedInput
                  value={response.priceSearchPattern}
                  onValueCommit={(v: string) => updateResponse({ priceSearchPattern: v })}
                  onBlur={(e) => {
                    if (response.priceUseRegex) {
                      const error = validateRegex(e.target.value)
                      setErrors(prev => ({ ...prev, bidPriceSearchPattern: error }))
                    }
                  }}
                  onChange={() => {
                    if (errors.bidPriceSearchPattern) {
                      setErrors(prev => ({ ...prev, bidPriceSearchPattern: '' }))
                    }
                  }}
                  placeholder="Enter search pattern"
                  className={cn(errors.bidPriceSearchPattern && 'border-destructive')}
                />
                {errors.bidPriceSearchPattern && (
                  <p className="text-xs text-destructive mt-1">{errors.bidPriceSearchPattern}</p>
                )}
              </FieldGroup>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={response.priceUseRegex}
                  onCheckedChange={(checked) => {
                    updateResponse({ priceUseRegex: checked === true })
                    if (!checked && errors.bidPriceSearchPattern) {
                      setErrors(prev => ({ ...prev, bidPriceSearchPattern: '' }))
                    }
                  }}
                />
                <span className="text-sm">Use regular expression</span>
              </label>
            </>
          ) : (
            <>
              <SectionHeading
                title="Redirect URL"
                description="Define the search pattern to extract the redirect URL."
              />
              <FieldGroup label="Search Pattern">
                <DebouncedInput
                  value={postResponse.redirectUrlSearchPattern}
                  onValueCommit={(v: string) => updatePostResponseSettings({ redirectUrlSearchPattern: v })}
                  onBlur={(e) => {
                    if (postResponse.redirectUrlUseRegex) {
                      const error = validateRegex(e.target.value)
                      setErrors(prev => ({ ...prev, redirectUrlSearchPattern: error }))
                    }
                  }}
                  onChange={() => {
                    if (errors.redirectUrlSearchPattern) {
                      setErrors(prev => ({ ...prev, redirectUrlSearchPattern: '' }))
                    }
                  }}
                  placeholder="Enter search pattern"
                  className={cn(errors.redirectUrlSearchPattern && 'border-destructive')}
                />
                {errors.redirectUrlSearchPattern && (
                  <p className="text-xs text-destructive mt-1">{errors.redirectUrlSearchPattern}</p>
                )}
              </FieldGroup>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={postResponse.redirectUrlUseRegex}
                  onCheckedChange={(checked) => {
                    updatePostResponseSettings({
                      redirectUrlUseRegex: checked === true,
                    })
                    if (!checked && errors.redirectUrlSearchPattern) {
                      setErrors(prev => ({ ...prev, redirectUrlSearchPattern: '' }))
                    }
                  }}
                />
                <span className="text-sm">Use regular expression</span>
              </label>
            </>
          )}
        </>
      )}

      <Separator />

      {/* PING only: Enable Ping during Sort */}
      {isPing && (
        <label className="flex gap-4 items-start cursor-pointer">
          <Switch
            checked={response.enablePingDuringSort}
            onCheckedChange={(checked) =>
              updateResponse({ enablePingDuringSort: checked })
            }
          />
          <div className="space-y-0.5">
            <span className="text-sm font-normal">Enable Ping during Sort</span>
            <p className="text-xs text-muted-foreground">
              Execute a ping during sorting to retrieve a real-time bid price. Successful pings update the account price used for ranking; failed pings exclude the account from selection.
            </p>
          </div>
        </label>
      )}
    </div>
  )
}
