import { useRef, useMemo, useState, useCallback } from 'react'
import { useDeliveryMethodStore } from '@/features/delivery-method/store'
import { CodeEditor, type CodeEditorHandle } from '@/components/code-editor'
import type { InsertableField } from '@/components/code-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface RequestBodySettingsProps {
  phase: 'ping' | 'post'
}

export function RequestBodySettings({ phase }: RequestBodySettingsProps) {
  const isPing = phase === 'ping'

  const pingBody = useDeliveryMethodStore((s) => s.config.ping.requestBody.body)
  const postBody = useDeliveryMethodStore((s) => s.config.post.requestBody.body)
  const updatePingRequestBody = useDeliveryMethodStore((s) => s.updatePingRequestBody)
  const updatePostRequestBody = useDeliveryMethodStore((s) => s.updatePostRequestBody)
  const getPingMappedFields = useDeliveryMethodStore((s) => s.getPingMappedFields)
  const getPostMappedFields = useDeliveryMethodStore((s) => s.getPostMappedFields)

  const body = isPing ? pingBody : postBody
  const updateBody = isPing ? updatePingRequestBody : updatePostRequestBody

  const editorRef = useRef<CodeEditorHandle>(null)
  const [selectedField, setSelectedField] = useState<string>('')

  const mappedFields = useMemo(() => {
    return isPing ? getPingMappedFields() : getPostMappedFields()
  }, [isPing, getPingMappedFields, getPostMappedFields])

  const insertableFields: InsertableField[] = useMemo(() => {
    return mappedFields.map((f) => ({
      tag: f.name,
      label: f.mappedTo,
      category: f.source === 'ping' ? 'PING Fields' : 'POST Fields',
    }))
  }, [mappedFields])

  const handleInsert = useCallback(() => {
    if (selectedField) {
      editorRef.current?.insertField(selectedField)
      setSelectedField('')
    }
  }, [selectedField])

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center pb-3">
        <div className="flex-1">
          <Select value={selectedField} onValueChange={setSelectedField}>
            <SelectTrigger className="rounded-r-none border-r-0">
              <SelectValue placeholder="-- Select mapping to insert --" />
            </SelectTrigger>
            <SelectContent>
              {mappedFields.map((f) => (
                <SelectItem key={f.id} value={f.name}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="icon"
          className="rounded-l-none shrink-0"
          onClick={handleInsert}
          disabled={!selectedField}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <CodeEditor
          ref={editorRef}
          value={body}
          onChange={updateBody}
          insertableFields={insertableFields}
          className="rounded-none border-x-0 border-b-0"
        />
      </div>
    </div>
  )
}
