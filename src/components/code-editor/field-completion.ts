import { type CompletionContext, type CompletionResult, autocompletion } from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'

export interface InsertableField {
  tag: string
  label: string
  category?: string
}

function fieldCompletionSource(fields: InsertableField[]) {
  return (context: CompletionContext): CompletionResult | null => {
    // Trigger on [ character or after typing inside brackets
    const beforeCursor = context.matchBefore(/\[[\w_]*/)
    if (!beforeCursor) return null

    return {
      from: beforeCursor.from,
      options: fields.map((f) => ({
        label: `[${f.tag}]`,
        displayLabel: f.tag,
        apply: `[${f.tag}]`,
        boost: 0,
      })),
      filter: true,
    }
  }
}

export function fieldCompletionExtension(fields: InsertableField[]): Extension {
  return autocompletion({
    override: [fieldCompletionSource(fields)],
    activateOnTyping: true,
    icons: false,
  })
}
