import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign, ArrowUp, Square, Plus, History } from "lucide-react";
import { createChatCompletion, type ChatMessage } from "@/integrations/openai/client";
import { useToast } from "@/hooks/use-toast";
import { useEditorBridge } from "@/context/EditorBridge";
import { applyOperations, jsonToPlainMarkdown } from "@/lib/editor-api";
import { buildSystemPrompt, buildUserMessage } from "@/lib/ai/blueprint-prompts";
import { parseOperations } from "@/lib/ai/blueprint-tools";
import ChangePreviewDialog from "@/components/blueprint/ChangePreviewDialog";

export default function QuestionSidebarPlaceholder() {
  const { toast } = useToast();
  const { editor } = useEditorBridge();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-4o-mini");
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // We no longer show preview dialog; we directly apply and highlight.

  useEffect(() => {
    // Scroll to bottom on new message
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    const content = query.trim();
    if (!content || loading) return;
    const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      toast({ title: "Missing API key", description: "Set VITE_OPENAI_API_KEY in your .env to use chat.", variant: "destructive" });
      return;
    }
    const newMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      // Build doc context
      const currentDocMd = editor ? jsonToPlainMarkdown(editor.getJSON()) : "";
      const system = buildSystemPrompt();
      const user = buildUserMessage(content, currentDocMd);
      const assistant = await createChatCompletion([{ role: 'user', content: user }], { model, system, signal: abortRef.current.signal });
      // Try parse operations
      const ops = parseOperations(assistant);
      if (!ops || !editor) {
        setMessages([...newMessages, { role: "assistant", content: assistant }]);
        setLoading(false);
        return;
      }
      // Apply operations (no highlight)
      applyOperations(editor, ops);
      setMessages([...newMessages, { role: "assistant", content: "Applied changes." }]);
    } catch (err: any) {
      toast({ title: "Chat failed", description: String(err?.message || err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const highlightSectionByHeading = (headingText: string) => {
    if (!editor) return;
    const doc = editor.state.doc;
    let from = -1; let to = doc.content.size; let level = 4;
    doc.descendants((node: any, pos: number) => {
      if (node.type?.name === 'heading') {
        if (from === -1 && (node.textContent || '').trim() === headingText.trim()) {
          from = pos;
          level = node.attrs?.level ?? 2;
          return true; // continue scanning for next heading
        }
        if (from !== -1 && (node.attrs?.level ?? 3) <= level) {
          to = pos - 1; // end just before next heading
          return false; // stop scan
        }
      }
      return true;
    });
    if (from !== -1) {
      editor.chain().focus().setTextSelection({ from: Math.max(0, from), to: Math.max(from + 1, to) }).setHighlight({ color: '#dcfce7' }).run();
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-border" style={{ backgroundColor: '#f2f1eb' }}>
      {/* Header with buttons */}
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          title="New chat"
        >
          <Plus className="h-2.5 w-2.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0"
          title="Chat history"
        >
          <History className="h-2.5 w-2.5" />
        </Button>
      </div>

      {/* Messages area */}
      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-xs text-foreground/60">Ask questions about planning your path to college. Your API key is required.</div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-lg px-3 py-2 bg-primary text-primary-foreground text-sm' : 'mr-auto max-w-[85%] rounded-lg px-3 py-2 bg-muted text-foreground text-sm whitespace-pre-wrap'}>
              {m.content}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="p-3 shrink-0">
        {/* Composer with improved contrast */}
        <div className="bg-white/80 border border-border rounded-lg p-3 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Line 1: @ button */}
            <div className="flex items-center">
            <span className="inline-flex items-center gap-1 rounded-md border border-border px-1 py-0 text-xs text-foreground/80">
              <AtSign className="h-3 w-3" />
            </span>
            </div>

            {/* Line 2: Input with extra spacing */}
            <div>
              <input
                className="w-full bg-transparent outline-none border-0 text-xs placeholder:text-foreground/50"
                placeholder="Plan, search, build anything"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                disabled={loading}
              />
            </div>

            {/* Line 3: Model selection and Send button */}
            <div className="flex items-center justify-between">
              <select
                className="rounded-md border border-border bg-muted/40 text-xs px-1 py-0"
                value={model}
                onChange={e => setModel(e.target.value)}
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
              </select>
              {loading ? (
                <Button size="sm" variant="secondary" className="h-6 px-1.5" onClick={stop}>
                  <Square className="h-3 w-3" />
                </Button>
              ) : (
                <Button size="sm" className="h-6 px-1.5" onClick={send} disabled={!query.trim()}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* No modal preview */}
    </div>
  );
}


