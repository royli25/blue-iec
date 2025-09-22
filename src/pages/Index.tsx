import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { createChatCompletion, type ChatMessage } from "@/integrations/openai/client";
import { SYSTEM_HOME_CHAT } from "@/config/prompts";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import renderMarkdownToHtml from "@/lib/markdown";

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Rotating placeholder prompts focused on opportunities and stories
  const PROMPTS: string[] = [
    "Help me find opportunities in the Bay Area for a Psychology major.",
    "Suggest summer research or internships for a junior into neuroscience.",
    "Find community service roles for a student passionate about climate policy.",
    "Draft a cohesive story linking robotics, entrepreneurship, and leadership.",
    "Recommend clubs and projects to build a compelling CS transfer story.",
  ];
  const [promptIndex, setPromptIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    if (isFocused || query.length > 0) return; // pause rotation while typing or when text exists
    const interval = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
        setPhase('in');
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, query.length]);
  const rotatingPlaceholder = PROMPTS[promptIndex];
  const placeholderClass = query.length > 0 ? '' : (phase === 'in' ? 'placeholder-in' : 'placeholder-out');
  // Markdown renderer for assistant messages
  const renderMarkdown = useMemo(() => (md: string) => renderMarkdownToHtml(md), []);
  const handleSend = async () => {
    const text = query.trim();
    if (!text) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setQuery("");
    setLoading(true);
    try {
      // Attach saved Application Context (if available) to the system prompt
      let systemPrompt = SYSTEM_HOME_CHAT;
      try {
        const { data: ctx } = await supabase.from('application_contexts').select('content').maybeSingle();
        if (ctx?.content) {
          systemPrompt = `${SYSTEM_HOME_CHAT}\n\nApplication Context (user-provided):\n${ctx.content}`;
        }
      } catch {
        // ignore fetch errors; proceed without context
      }

      const content = await createChatCompletion([
        { role: 'system', content: systemPrompt },
        ...nextMessages,
      ]);
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (err: any) {
      toast({ title: 'Search failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* top-right auth button / email */}
      <div className="absolute top-4 right-4 z-20 text-[12px]">
        {user ? (
          <details className="group relative">
            <summary className="list-none cursor-pointer rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">
              {user.email}
            </summary>
            <div className="absolute right-0 mt-1 w-40 rounded-md border border-border bg-white/90 backdrop-blur-md shadow-sm p-2 text-right">
              
              <button
                onClick={async () => { try { await signOut(); } catch {} }}
                className="w-full text-right px-3 py-2 hover:bg-white text-foreground/80"
              >
                Log out
              </button>
            </div>
          </details>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white"
          >
            Log in
          </button>
        )}
      </div>
      {/* subtle warm background with grid */}
      <div className="absolute inset-0 bg-[hsl(45_52%_97%)]" />
      <div className="absolute inset-0 grid-bg opacity-70" />

      {/* Landing vs Chat layout */}
      {messages.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
          {/* logo above search */}
          <div className="mx-auto max-w-3xl mb-6 flex justify-center">
            <img src="/blueprint.png" alt="BluePrint" className="h-8 object-contain" />
          </div>
          <div className="mx-auto max-w-3xl rounded-xl border border-border/70 bg-white/80 shadow-[0_30px_60px_-20px_rgba(2,6,23,0.12),0_12px_24px_rgba(2,6,23,0.06)] backdrop-blur-md">
            <div className="relative">
              <textarea
                rows={4}
                placeholder={rotatingPlaceholder}
                className={`w-full resize-none rounded-xl bg-transparent px-5 pr-12 py-4 text-[15px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none ${placeholderClass}`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="absolute right-3 bottom-3 h-8 w-8 flex items-center justify-center rounded-md border border-border bg-white/80 text-foreground/70 disabled:opacity-50 disabled:pointer-events-none"
                title={loading ? 'Searching...' : 'Search'}
              >
                <Search className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
          {/* two wide option boxes (50% width each) */}
          <div className="mx-auto mt-3 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <button onClick={() => navigate(user ? '/profile' : '/auth')} className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">Provide Profile Context</button>
            <button onClick={() => navigate('/technology')} className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">
              Understand our Technology
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 px-6 flex flex-col">
          <div className="flex-1 overflow-y-auto pt-6 pb-[200px]">
            <div className="mx-auto max-w-2xl space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`${m.role === 'user' ? 'text-foreground/90' : 'text-foreground'} `}>
                  <div
                    className={`rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3`}
                    style={{ backgroundColor: m.role === 'user' ? '#F2DABA' : '#F1E9DA' }}
                  >
                    {m.role === 'assistant' ? (
                      <div
                        className="prose prose-sm prose-neutral max-w-none leading-7 text-[14px] prose-headings:mt-0 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold prose-h1:text-[18px] prose-h2:text-[16px] prose-h3:text-[14px]"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap leading-7 text-[14px]">
                        {m.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-foreground">
                  <div className="rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3 inline-block" style={{ backgroundColor: '#F1E9DA' }}>
                    <div className="typing-dots text-[14px] leading-7">
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="fixed left-1/2 -translate-x-1/2 bottom-4 w-full px-6 z-20">
            <div className="mx-auto w-full max-w-2xl rounded-xl border border-white/80 bg-white/80 shadow-[0_10px_20px_rgba(2,6,23,0.08)] backdrop-blur-lg">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Type your message..."
                  className={`w-full resize-none rounded-xl bg-transparent px-5 pr-12 py-2 text-[15px] leading-7 text-foreground placeholder:text-foreground/50 focus:outline-none`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading}
                  className="absolute right-3 bottom-2 h-8 w-8 flex items-center justify-center rounded-md border border-white/80 bg-white/80 backdrop-blur-md text-foreground/70 disabled:opacity-50 disabled:pointer-events-none"
                  title={loading ? 'Sending...' : 'Send'}
                >
                  <Search className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-2xl mt-2">
              <button
                onClick={() => navigate(user ? '/profile' : '/auth')}
                className="w-full rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white"
              >
                Add Profile Context
              </button>
            </div>
          </div>
        </div>
      )}

      {/* floating chat removed per request */}
    </div>
  );
};

export default Index;
