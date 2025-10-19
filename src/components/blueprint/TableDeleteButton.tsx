import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TableDeleteButtonProps {
  editor: Editor;
  container: HTMLElement | null;
}

export default function TableDeleteButton({ editor, container }: TableDeleteButtonProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      try {
        if (!container) { setVisible(false); return; }
        const { state, view } = editor;
        const { $from } = state.selection;
        const domAt = view.domAtPos($from.pos) as any;
        let el: HTMLElement | null = (domAt?.node as Node | null) as HTMLElement | null;
        if (el && el.nodeType === 3) el = el.parentElement; // text -> element
        let tableEl: HTMLElement | null = null;
        let cur: HTMLElement | null = el;
        while (cur && cur !== view.dom as HTMLElement) {
          if (cur.tagName && cur.tagName.toLowerCase() === 'table') { tableEl = cur; break; }
          cur = cur.parentElement;
        }
        if (!tableEl) { setVisible(false); return; }
        const tb = tableEl.getBoundingClientRect();
        const cb = container.getBoundingClientRect();
        const left = tb.right - cb.left - 20; // offset inside container
        const top = tb.top - cb.top - 10; // slightly above
        setPos({ left, top });
        setVisible(true);
      } catch {
        setVisible(false);
      }
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    update();
    return () => {
      try {
        editor.off('selectionUpdate', update);
        editor.off('transaction', update);
      } catch {}
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [editor, container]);

  if (!visible) return null;

  return (
    <div style={{ position: 'absolute', left: pos.left, top: pos.top, zIndex: 50 }}>
      <Button
        size="sm"
        variant="destructive"
        className="h-6 w-6 p-0 rounded-full shadow"
        title="Delete table"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}


