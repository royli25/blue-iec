import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
// highlight removed
import Code from "@tiptap/extension-code";
import { Button } from "@/components/ui/button";
import { createChatCompletion } from "@/integrations/openai/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import Toolbar from "./Toolbar";
import { useEditorBridge } from "@/context/EditorBridge";
import TableDeleteButton from "@/components/blueprint/TableDeleteButton";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
// highlight removed

interface RichTextEditorProps {
  value: any;
  onChange: (value: any) => void;
  saving?: boolean;
  onMount?: (editor: Editor) => void;
}

export default function RichTextEditor({ value, onChange, saving, onMount }: RichTextEditorProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const { setEditor } = useEditorBridge();
  
  // Default skeleton when there is no existing content
  const defaultContent = useMemo(() => ({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'My Blueprint' }],
      },
      { type: 'paragraph' },
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'My Calendar' }],
      },
      { type: 'paragraph' },
    ],
  }), []);

  const extensions = useMemo(() => [
    StarterKit.configure({
      code: false, // We'll add it separately for better control
    }),
    Code,
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder: "Start planning…" }),
  ], []);

  const editor = useEditor({
    extensions,
    content: value ?? defaultContent,
    editorProps: { attributes: { class: "prose prose-neutral max-w-none focus:outline-none tiptap-compact" } },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    setEditor(editor);
    if (onMount) onMount(editor);
    // If external value changes (e.g., after fetch), set content once
    if (value && JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
      editor.commands.setContent(value);
    }
    return () => {
      setEditor(null);
    };
  }, [editor, value]);

  // Parent owns initialization/persistence of default content

  const generateBlueprint = async () => {
    if (!editor) return;
    setGenerating(true);
    try {
      const systemPrompt = `You are a college planning assistant. Generate a comprehensive blueprint for a high school student's path to college applications.

Content rules (critical):
- Write in plain text paragraphs and simple dash bullet lines. Do NOT use inline markdown for styling (no **bold**, *italic*, backticks, or code blocks).
- If you include headings, use only one level with '## ' for section titles (avoid '###').
- Do not output raw markdown symbols like '###', '**', or '__'.
- Keep writing specific, practical, and concise.

Include sections for:
1. Academic Planning (GPA, course selection, test prep)
2. Extracurricular Activities (leadership, community service, clubs)
3. Standardized Testing (SAT/ACT timeline and prep)
4. College Research (target schools, reach schools, safety schools)
5. Application Timeline (deadlines, essays, recommendations)
6. Financial Planning (scholarships, FAFSA, costs)`;

      const response = await createChatCompletion([
        { role: "user", content: "Generate a comprehensive college planning blueprint for a high school student." }
      ], { system: systemPrompt });

      // Convert the response to TipTap JSON format
      const lines = response.split('\n');
      const content = {
        type: 'doc',
        content: lines.map(line => {
          if (line.startsWith('# ')) {
            return {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: line.substring(2) }]
            };
          } else if (line.startsWith('## ')) {
            return {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: line.substring(3) }]
            };
          } else if (line.startsWith('### ')) {
            return {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: line.substring(4) }]
            };
          } else if (line.trim()) {
            return {
              type: 'paragraph',
              content: [{ type: 'text', text: line }]
            };
          }
          return null;
        }).filter(Boolean)
      };

      editor.commands.setContent(content);
      onChange(content);
    } catch (error: any) {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Treat the editor as empty when it contains only whitespace OR just the seeded H1s
  const isEmpty = useMemo(() => {
    if (!editor) return true;
    const text = editor.getText();
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
    const normalized = normalize(text);
    if (normalized === '') return true;
    const seedNormalized = normalize('My Blueprint My Calendar');
    return normalized === seedNormalized;
  }, [editor?.state]);

  if (!editor) return null;

  // Button overlays below seeded headings when empty
  const [bpBtnPos, setBpBtnPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [calBtnPos, setCalBtnPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!editor) return;
    const updatePositions = () => {
      const container = document.getElementById('editor-scroll');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      let blueprintPos: number | null = null;
      let calendarPos: number | null = null;
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type?.name === 'heading' && node.attrs?.level === 1) {
          const txt = (node.textContent || '').trim();
          if (txt === 'My Blueprint' && blueprintPos === null) blueprintPos = pos;
          if (txt === 'My Calendar' && calendarPos === null) calendarPos = pos;
        }
        return true;
      });
      const getBelow = (pos: number | null) => {
        if (pos == null) return null;
        const el = editor.view.nodeDOM(pos) as HTMLElement | null;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        // Compute width so right edge aligns with toolbar's right boundary
        const cs = getComputedStyle(container);
        const qsWidth = parseFloat(cs.getPropertyValue('--qs-width') || '0');
        const rightGutter = 8; // matches toolbar right offset
        const left = rect.left - containerRect.left;
        const availableRight = container.clientWidth - (qsWidth + rightGutter);
        const width = Math.max(0, availableRight - left);
        return { top: rect.bottom - containerRect.top + 8, left, width };
      };
      setBpBtnPos(getBelow(blueprintPos));
      setCalBtnPos(getBelow(calendarPos));
    };
    updatePositions();
    const container = document.getElementById('editor-scroll');
    const onScroll = () => updatePositions();
    window.addEventListener('resize', updatePositions);
    editor.on('update', updatePositions);
    container?.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('resize', updatePositions);
      editor.off('update', updatePositions as any);
      container?.removeEventListener('scroll', onScroll);
    };
  }, [editor, isEmpty]);

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto">
      <Toolbar editor={editor} saving={saving} />
      <div id="editor-scroll" className="flex-1 overflow-auto relative" style={{ paddingTop: 'calc(var(--editor-toolbar-height) + 0.5rem)', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <EditorContent editor={editor} />
        {isEmpty && bpBtnPos && (
          <div className="absolute" style={{ top: bpBtnPos.top, left: bpBtnPos.left, width: bpBtnPos.width }}>
            <Button
              onClick={generateBlueprint}
              disabled={generating}
              className="text-xs h-7 px-3 w-full pointer-events-auto flex items-center justify-between"
              style={{ backgroundColor: '#EFDBCB', borderColor: '#EFDBCB', borderWidth: '1px', borderStyle: 'solid', color: '#000000' }}
            >
              <span>{generating ? 'Generating...' : 'Generate a base blueprint to get started'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isEmpty && calBtnPos && (
          <div className="absolute" style={{ top: calBtnPos.top, left: calBtnPos.left, width: calBtnPos.width }}>
            <Button
              onClick={generateBlueprint}
              disabled={generating}
              className="text-xs h-7 px-3 w-full pointer-events-auto flex items-center justify-between"
              style={{ backgroundColor: '#EFDBCB', borderColor: '#EFDBCB', borderWidth: '1px', borderStyle: 'solid', color: '#000000' }}
            >
              <span>{generating ? 'Generating...' : 'Generate a base calendar to get started'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <TableDeleteButton editor={editor} container={typeof document !== 'undefined' ? document.getElementById('editor-scroll') : null} />
        {/* Review bar removed */}
      </div>
    </div>
  );
}


