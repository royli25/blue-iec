import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, ChevronRight } from "lucide-react";

type Heading = { id: string; level: number; text: string };

interface TableOfContentsProps {
  editor: Editor | null;
}

export default function TableOfContents({ editor }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

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

  const toggleCollapse = (headingId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(headingId)) {
        next.delete(headingId);
      } else {
        next.add(headingId);
      }
      return next;
    });
  };

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

  // Group headings by H1 sections
  const sections = useMemo(() => {
    const result: Array<{ h1: Heading; children: Heading[] }> = [];
    let currentSection: { h1: Heading; children: Heading[] } | null = null;
    
    for (const h of headings) {
      if (h.level === 1) {
        if (currentSection) result.push(currentSection);
        currentSection = { h1: h, children: [] };
      } else if (currentSection) {
        currentSection.children.push(h);
      }
    }
    if (currentSection) result.push(currentSection);
    
    return result;
  }, [headings]);

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center px-2 py-1 border-b border-border text-sm font-medium h-8">Contents</div>
      <ul className="p-2 space-y-1 text-sm">
        {headings.length === 0 && (
          <li className="text-foreground/60 text-xs px-1">No headings yet</li>
        )}
        {sections.map(section => {
          const isCollapsed = collapsed.has(section.h1.id);
          return (
            <li key={section.h1.id}>
              <div className="flex items-center">
                <button
                  className="p-1 hover:bg-muted/40 rounded mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(section.h1.id);
                  }}
                  aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                <button
                  className="flex-1 text-left hover:bg-muted/40 rounded px-2 py-1"
                  onClick={() => handleClick(section.h1)}
                >
                  {section.h1.text || 'Untitled'}
                </button>
              </div>
              {!isCollapsed && section.children.length > 0 && (
                <ul className="ml-6 mt-1 space-y-1">
                  {section.children.map(child => (
                    <li key={child.id}>
                      <button
                        className="w-full text-left hover:bg-muted/40 rounded px-2 py-1"
                        style={{ paddingLeft: child.level === 2 ? 8 : 16 }}
                        onClick={() => handleClick(child)}
                      >
                        {child.text || 'Heading'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


