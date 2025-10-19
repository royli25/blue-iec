import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";

type Heading = { id: string; level: number; text: string };

interface TableOfContentsProps {
  editor: Editor | null;
}

export default function TableOfContents({ editor }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const json = editor.getJSON();
      const list: Heading[] = [];
      const walk = (node: any) => {
        if (!node) return;
        if (node.type === 'heading' && node.attrs?.level && Array.isArray(node.content)) {
          const text = node.content.map((c: any) => c.text || '').join('');
          const id = `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${list.length}`;
          list.push({ id, level: node.attrs.level, text });
        }
        if (Array.isArray(node.content)) node.content.forEach(walk);
      };
      walk(json);
      setHeadings(list);
    };
    update();
    editor.on('update', update);
    return () => { editor.off('update', update); };
  }, [editor]);

  const handleClick = (h: Heading) => {
    if (!editor) return;
    // Find the heading by text occurrence and move caret there
    const doc = editor.state.doc;
    let foundPos: number | null = null;
    let headingPos: number | null = null;
    doc.descendants((node, pos) => {
      if (foundPos !== null) return false;
      if ((node as any).type?.name === 'heading') {
        const txt = node.textContent || '';
        if (txt === h.text) {
          headingPos = pos; // start position of heading node
          foundPos = pos + 1; // inside the heading
          return false;
        }
      }
      return true;
    });
    if (foundPos !== null) {
      editor.chain().focus().setTextSelection(foundPos).scrollIntoView().run();
      // Align the clicked heading to the top of the scroll container
      setTimeout(() => {
        try {
          const headingEl = headingPos !== null ? (editor.view.nodeDOM(headingPos) as HTMLElement | null) : null;
          if (!headingEl) return;
          // find nearest scrollable ancestor
          let parent: HTMLElement | null = headingEl.parentElement;
          const isScrollable = (el: HTMLElement) => {
            const s = getComputedStyle(el);
            return /(auto|scroll)/.test(s.overflowY);
          };
          while (parent && !isScrollable(parent)) {
            parent = parent.parentElement;
          }
          const container = parent || (document.scrollingElement as HTMLElement | null);
          if (!container) return;
          const containerRect = container.getBoundingClientRect();
          const headingRect = headingEl.getBoundingClientRect();
          const delta = headingRect.top - containerRect.top - 8; // small top margin
          if (typeof (container as any).scrollBy === 'function') {
            (container as any).scrollBy({ top: delta, behavior: 'smooth' });
          } else {
            container.scrollTop += delta;
          }
        } catch {}
      }, 0);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center px-2 py-1 border-b border-border text-sm font-medium h-8">Contents</div>
      <ul className="p-2 space-y-1 text-sm">
        {headings.length === 0 && (
          <li className="text-foreground/60 text-xs px-1">No headings yet</li>
        )}
        {headings.map(h => (
          <li key={h.id}>
            <button
              className="w-full text-left hover:bg-muted/40 rounded px-2 py-1"
              style={{ paddingLeft: h.level === 1 ? 8 : h.level === 2 ? 16 : 24 }}
              onClick={() => handleClick(h)}
            >
              {h.text || (h.level === 1 ? 'Untitled' : 'Heading')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


