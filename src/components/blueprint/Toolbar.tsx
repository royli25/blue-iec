import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Type, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  Code,
  Link
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  saving?: boolean;
}

export default function Toolbar({ editor, saving }: ToolbarProps) {
  if (!editor) return null;

  const toolbarItems = [
    // Text formatting
    {
      group: [
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive('heading', { level: 1 }),
          label: 'H1',
          title: 'Heading 1',
          className: 'text-xs'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
          label: 'H2',
          title: 'Heading 2',
          className: 'text-xs'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive('heading', { level: 3 }),
          label: 'H3',
          title: 'Heading 3',
          className: 'text-xs'
        }
      ]
    },
    // Text styling
    {
      group: [
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
          icon: Bold,
          title: 'Bold',
          className: 'font-bold'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
          icon: Italic,
          title: 'Italic',
          className: 'italic'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleCode().run(),
          isActive: editor.isActive('code'),
          icon: Code,
          title: 'Code',
          className: 'font-mono'
        }
      ]
    },
    // Lists and blocks
    {
      group: [
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
          icon: List,
          title: 'Bullet List'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
          icon: ListOrdered,
          title: 'Numbered List'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive('blockquote'),
          icon: Quote,
          title: 'Quote'
        }
      ]
    },
    // Actions
    {
      group: [
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          icon: Undo,
          title: 'Undo'
        },
        {
          type: 'button' as const,
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          icon: Redo,
          title: 'Redo'
        }
      ]
    }
  ];

  return (
    <div
      className="flex items-center px-2 py-1 border-b border-border bg-[#EFDBCB] text-sm font-medium h-8 fixed z-10 rounded-t-md rounded-b-md"
      style={{
        left: 'var(--editor-left)',
        top: 'var(--editor-top)',
        right: 'calc(var(--qs-width) + 8px)',
      }}
    >
      {toolbarItems.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex items-center">
          {section.group.map((item, itemIndex) => (
            <div key={itemIndex}>
              {item.type === 'button' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={`
                    h-7 px-2 text-xs hover:bg-[#c46f45]/20 transition-colors
                    ${item.isActive ? 'bg-[#c46f45]/30 text-[#c46f45] font-semibold' : 'text-foreground/70'}
                    ${item.className || ''}
                  `}
                  title={item.title}
                >
                  {item.icon ? (
                    <item.icon className="h-3 w-3" />
                  ) : (
                    <span className={item.className}>{item.label}</span>
                  )}
                </Button>
              )}
            </div>
          ))}
          {sectionIndex < toolbarItems.length - 1 && (
            <Separator orientation="vertical" className="mx-2 h-4 bg-border/60" />
          )}
        </div>
      ))}
      
      <div className="ml-auto flex items-center gap-2">
        <div className="text-xs text-foreground/60">
          {saving ? 'Saving…' : 'Saved'}
        </div>
      </div>
    </div>
  );
}
