import { Mark, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attributes?: { color?: string }) => ReturnType
      unsetHighlight: () => ReturnType
    }
  }
}

export const HighlightMark = Mark.create({
  name: 'highlight',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => (element as HTMLElement).style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { style: `background-color: ${attributes.color}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-highlight]' },
      { tag: 'mark' },
      { tag: 'span[style*="background-color:"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-highlight': '' }), 0]
  },

  addCommands() {
    return {
      setHighlight: attributes => ({ commands }) => commands.setMark(this.name, attributes),
      unsetHighlight: () => ({ commands }) => commands.unsetMark(this.name),
    }
  },
})


