import { useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap } from '@codemirror/search'
import { bracketMatching, foldGutter, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { cn } from '@/lib/utils'
import { fieldCompletionExtension, type InsertableField } from './field-completion'

export interface CodeEditorHandle {
  insertField: (field: string) => void
}

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  insertableFields?: InsertableField[]
  readOnly?: boolean
  className?: string
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  ({ value, onChange, insertableFields = [], readOnly = false, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewRef = useRef<EditorView | null>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    const extensions = useMemo(() => {
      const exts = [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        bracketMatching(),
        foldGutter(),
        syntaxHighlighting(HighlightStyle.define([
          { tag: tags.string, color: '#2563eb' },
          { tag: tags.number, color: '#1d4ed8' },
          { tag: tags.bool, color: '#1e40af' },
          { tag: tags.null, color: '#6366f1' },
          { tag: tags.keyword, color: '#1e40af' },
          { tag: tags.propertyName, color: '#3c4b64' },
          { tag: tags.punctuation, color: '#636f83' },
          { tag: tags.bracket, color: '#636f83' },
          { tag: tags.comment, color: '#b1b7c1' },
        ]), { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current?.(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '12px', backgroundColor: 'var(--color-muted)' },
          '&.cm-focused': { outline: 'none' },
          '.cm-scroller': { overflow: 'auto', height: '100%' },
          '.cm-content': {
            fontFamily: '"Roboto Mono", ui-monospace, "Cascadia Code", Menlo, Consolas, monospace',
            padding: '8px 0',
            caretColor: 'var(--color-foreground)',
            backgroundColor: 'var(--color-background)',
          },
          '.cm-gutters': {
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-subtle)',
            borderRight: '1px solid var(--color-border)',
            minWidth: '40px',
            paddingRight: '4px',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-muted-foreground)',
          },
          '.cm-activeLine': {
            backgroundColor: 'transparent',
          },
          '&.cm-focused .cm-matchingBracket, .cm-matchingBracket': {
            backgroundColor: 'var(--color-primary-light) !important',
            color: 'var(--color-primary)',
            outline: 'none',
          },
          '.cm-line': {
            padding: '0 12px 0 8px',
          },
          '.cm-tooltip.cm-tooltip-autocomplete': {
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-lg)',
          },
          '.cm-tooltip.cm-tooltip-autocomplete > ul': {
            fontFamily: '"Roboto Mono", ui-monospace, Consolas, monospace',
            fontSize: '12px',
          },
          '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
            padding: '4px 8px',
            color: 'var(--color-foreground)',
          },
          '.cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]': {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
          },
          '.cm-completionDetail': {
            marginLeft: '12px',
            opacity: '0.7',
            fontStyle: 'normal',
          },
        }),
        json(),
      ]

      if (insertableFields.length > 0) {
        exts.push(fieldCompletionExtension(insertableFields))
      }

      if (readOnly) {
        exts.push(EditorState.readOnly.of(true))
      }

      return exts
    }, [insertableFields, readOnly])

    useEffect(() => {
      if (!containerRef.current) return

      const state = EditorState.create({
        doc: value,
        extensions,
      })

      const view = new EditorView({
        state,
        parent: containerRef.current,
      })

      viewRef.current = view

      return () => {
        view.destroy()
        viewRef.current = null
      }
      // Only recreate on extensions change, not on value
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extensions])

    // Sync external value changes without recreating editor
    useEffect(() => {
      const view = viewRef.current
      if (!view) return
      const currentValue = view.state.doc.toString()
      if (currentValue !== value) {
        view.dispatch({
          changes: { from: 0, to: currentValue.length, insert: value },
        })
      }
    }, [value])

    useImperativeHandle(ref, () => ({
      insertField(field: string) {
        const view = viewRef.current
        if (!view) return
        const { from, to } = view.state.selection.main
        const tag = `[${field}]`
        view.dispatch({
          changes: { from, to, insert: tag },
          selection: { anchor: from + tag.length },
        })
        view.focus()
      },
    }), [])

    return (
      <div data-slot="code-editor" className={cn('border border-border rounded-[4px] overflow-hidden h-full', className)}>
        <div ref={containerRef} className="h-full" />
      </div>
    )
  },
)
CodeEditor.displayName = 'CodeEditor'
