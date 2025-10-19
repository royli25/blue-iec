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
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
  const [generatingCalendar, setGeneratingCalendar] = useState(false);
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

  // Helpers: replace content under a given H1 without touching the heading itself
  const findSectionRange = (headingText: string): { from: number; to: number } | null => {
    if (!editor) return null;
    const { doc } = editor.state;
    let headingPos: number | null = null;
    let nextH1Pos: number | null = null;
    doc.descendants((node: any, pos: number) => {
      if (node.type?.name === 'heading' && node.attrs?.level === 1) {
        const txt = (node.textContent || '').trim();
        if (headingPos === null && txt === headingText) {
          headingPos = pos;
          return true;
        }
        if (headingPos !== null && nextH1Pos === null) {
          nextH1Pos = pos;
          return false; // we found the next section start
        }
      }
      return true;
    });
    if (headingPos === null) return null;
    const nodeAtHeading = doc.nodeAt(headingPos);
    if (!nodeAtHeading) return null;
    const from = headingPos + nodeAtHeading.nodeSize; // start right after the heading node
    const to = nextH1Pos !== null ? nextH1Pos : doc.content.size - 1; // up to before doc end
    return { from, to };
  };

  const parsePlainToNodes = (text: string): any[] => {
    const lines = text.split('\n');
    const nodes: any[] = [];
    let bulletItems: string[] = [];
    const flushBullets = () => {
      if (bulletItems.length === 0) return;
      nodes.push({
        type: 'bulletList',
        content: bulletItems.map((t) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] }))
      });
      bulletItems = [];
    };
    for (const raw of lines) {
      const line = raw.trimEnd();
      if (line.startsWith('- ')) {
        bulletItems.push(line.slice(2));
        continue;
      }
      if (line.trim() === '') {
        flushBullets();
        continue;
      }
      flushBullets();
      nodes.push({ type: 'paragraph', content: [{ type: 'text', text: line }] });
    }
    flushBullets();
    // Ensure at least one empty paragraph for cursor room
    if (nodes.length === 0) nodes.push({ type: 'paragraph' });
    return nodes;
  };

  const replaceSectionContent = (headingText: string, nodes: any[]) => {
    if (!editor) return;
    const range = findSectionRange(headingText);
    if (!range) return;
    editor.chain().focus().insertContentAt(range, nodes).run();
    onChange(editor.getJSON());
  };

  const generateBlueprint = async () => {
    if (!editor) return;
    setGeneratingBlueprint(true);
    try {
      const systemPrompt = `You write the student's main blueprint. Output only plain paragraphs and simple dash bullets, no markdown styling or code fences. Keep it concise and practical.`;
      const response = await createChatCompletion([
        { role: 'user', content: 'Generate a base college planning blueprint with sections like academic planning, activities, testing, research, timeline, and financial planning. Use short paragraphs and simple dash bullets.' }
      ], { system: systemPrompt });
      const nodes = parsePlainToNodes(response);
      replaceSectionContent('My Blueprint', nodes);
    } catch (error: any) {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setGeneratingBlueprint(false);
    }
  };

  const generateCalendar = async () => {
    if (!editor) return;
    setGeneratingCalendar(true);
    try {
      const systemPrompt = `You write a month-by-month application prep calendar. Output plain paragraphs and simple dash bullets only, no markdown styling.`;
      const response = await createChatCompletion([
        { role: 'user', content: 'Generate a base application planning calendar organized month-by-month with actionable tasks and milestones.' }
      ], { system: systemPrompt });
      const nodes = parsePlainToNodes(response);
      replaceSectionContent('My Calendar', nodes);
    } catch (error: any) {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    } finally {
      setGeneratingCalendar(false);
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
  const [bpBtnPos, setBpBtnPos] = useState<{ top: number; left: number } | null>(null);
  const [calBtnPos, setCalBtnPos] = useState<{ top: number; left: number } | null>(null);

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
        return { top: rect.bottom - containerRect.top + 8, left: rect.left - containerRect.left };
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
      <div id="editor-scroll" className="flex-1 overflow-auto relative" style={{ paddingTop: 'calc(var(--editor-toolbar-height) + 0.5rem)', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: isEmpty ? '6rem' : undefined }}>
        <EditorContent editor={editor} />
        {isEmpty && bpBtnPos && (
          <div className="absolute z-10" style={{ top: bpBtnPos.top, left: bpBtnPos.left }}>
            <Button
              onClick={generateBlueprint}
              disabled={generatingBlueprint}
              className="text-xs h-7 px-3 pointer-events-auto flex items-center justify-between"
              style={{ backgroundColor: '#EFDBCB', borderColor: '#EFDBCB', borderWidth: '1px', borderStyle: 'solid', color: '#000000' }}
            >
              <span>{generatingBlueprint ? 'Generating...' : 'Generate a base blueprint to get started'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isEmpty && calBtnPos && (
          <div className="absolute z-10" style={{ top: calBtnPos.top, left: calBtnPos.left }}>
            <Button
              onClick={generateCalendar}
              disabled={generatingCalendar}
              className="text-xs h-7 px-3 pointer-events-auto flex items-center justify-between"
              style={{ backgroundColor: '#EFDBCB', borderColor: '#EFDBCB', borderWidth: '1px', borderStyle: 'solid', color: '#000000' }}
            >
              <span>{generatingCalendar ? 'Generating...' : 'Generate a base calendar to get started'}</span>
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


