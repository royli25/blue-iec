import { ChevronRight, ChevronDown, Clipboard, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { createChatCompletion, extractSchoolNames, type ChatMessage } from "@/integrations/openai/client";
import { SYSTEM_HOME_CHAT } from "@/config/prompts";
import { useNavigate } from "react-router-dom";
import renderMarkdownToHtml from "@/lib/markdown";
import { parseCardSections, parseCardWithDropdown } from "@/lib/utils";
import { useProfileContext } from '@/hooks/useProfileContext';
import { buildKbContextBlock, buildSimilarProfilesBlock, fetchStudentsBySchool } from "@/integrations/supabase/search";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getContextualSystemPrompt, profileData, isLoading: profileLoading } = useProfileContext();
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
  const [retryingIndex, setRetryingIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [disliked, setDisliked] = useState<Set<number>>(new Set());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Persist chat state so edits and HMR don't reset the UI during development
  useEffect(() => {
    try {
      const rawMessages = sessionStorage.getItem('home.messages.v1');
      if (rawMessages) {
        const parsed: ChatMessage[] = JSON.parse(rawMessages);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      const rawQuery = sessionStorage.getItem('home.query.v1');
      if (rawQuery) setQuery(rawQuery);
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem('home.messages.v1', JSON.stringify(messages)); } catch {}
  }, [messages]);
  useEffect(() => {
    try { sessionStorage.setItem('home.query.v1', query); } catch {}
  }, [query]);
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
  const renderMarkdown = useMemo(() => (md: string, linkifyProfiles = false) => renderMarkdownToHtml(md, linkifyProfiles), []);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: 'Copied to clipboard' });
    } catch {}
  };

  const handleFeedback = (idx: number, type: 'up' | 'down') => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (type === 'up') { next.add(idx); } else { next.delete(idx); }
      return next;
    });
    setDisliked((prev) => {
      const next = new Set(prev);
      if (type === 'down') { next.add(idx); } else { next.delete(idx); }
      return next;
    });
  };

  const handleRetryMessage = async (assistantIndex: number) => {
    setRetryingIndex(assistantIndex);
    try {
      const contextualSystemPrompt = getContextualSystemPrompt(SYSTEM_HOME_CHAT);
      // Build context up to the triggering user message (if any), otherwise up to assistantIndex
      let cutoff = assistantIndex;
      for (let j = assistantIndex - 1; j >= 0; j--) {
        if (messages[j]?.role === 'user') { cutoff = j + 1; break; }
      }
      const convo = messages.slice(0, cutoff);
      const content = await createChatCompletion([
        { role: 'system', content: contextualSystemPrompt },
        ...convo,
      ]);
      setMessages((prev) => prev.map((msg, idx) => idx === assistantIndex ? { role: 'assistant', content } : msg));
    } catch (err: any) {
      toast({ title: 'Retry failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setRetryingIndex(null);
    }
  };
  const handleSend = async () => {
    const text = query.trim();
    if (!text) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setQuery("");
    setLoading(true);
    try {
      // Use the profile context to enhance the system prompt
      const contextualSystemPrompt = getContextualSystemPrompt(SYSTEM_HOME_CHAT);

      // STEP 1: Extract school names from the query using AI
      let schoolNames: string[] = [];
      try {
        schoolNames = await extractSchoolNames(text);
      } catch (error) {
        console.error('Error extracting school names:', error);
      }

      // STEP 2: Choose retrieval strategy based on whether schools were mentioned
      let studentProfilesBlock = '';
      if (schoolNames.length > 0) {
        // If schools are mentioned, fetch students who applied to those schools
        const { block } = await fetchStudentsBySchool(schoolNames, { k: 10, maxTotalChars: 4000 });
        studentProfilesBlock = block;
      } else if (profileData) {
        // Otherwise, fetch similar profiles based on the user's profile
        const { block } = await buildSimilarProfilesBlock(profileData, { k: 5, maxTotalChars: 4000 });
        studentProfilesBlock = block;
      }

      // STEP 3: Fetch knowledge base context
      const { block: kbBlock } = await buildKbContextBlock(text, { k: 5, maxCharsPerChunk: 500, maxTotalChars: 1800, header: 'KB Context', includeMetadata: true });

      // STEP 4: Build system prompt with student profiles first, then KB context
      let systemWithContext = contextualSystemPrompt;
      if (studentProfilesBlock) {
        systemWithContext += `\n\n---\n${studentProfilesBlock}`;
      }
      if (kbBlock) {
        systemWithContext += `\n\n---\n${kbBlock}`;
      }

      // Add context note about retrieval strategy
      if (schoolNames.length > 0) {
        systemWithContext += `\n\n---\nNOTE: The student profiles above were specifically retrieved because they applied to ${schoolNames.join(', ')}. Use these profiles to help the user understand their chances and compare their profile to students who applied to these schools.`;
      }

      const content = await createChatCompletion([
        { role: 'system', content: systemWithContext },
        ...nextMessages,
      ]);
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (err: any) {
      toast({ title: 'Search failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  const handleNewChat = () => {
    setMessages([]);
    setQuery("");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar onNewChat={handleNewChat} />
      <div className="relative h-screen w-screen overflow-hidden">
      {/* top-right auth button / email */}
      <div className="absolute top-4 right-4 z-20 text-[12px] space-y-2">
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
                  if (e.key === 'Enter' && !e.shiftKey) {
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
                title={loading ? 'Sending...' : 'Send'}
              >
                <ChevronRight className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
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
            <div className="mx-auto max-w-2xl space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`${m.role === 'user' ? 'text-foreground/90' : 'text-foreground'} `}>
                  {(() => {
                    const isAssistant = m.role === 'assistant';
                    if (!isAssistant) {
                      return (
                        <div
                          className={`rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3`}
                          style={{ backgroundColor: '#F2DABA' }}
                        >
                          <div className="whitespace-pre-wrap leading-7 text-[14px]">{m.content}</div>
                        </div>
                      );
                    }
                    const { preamble, cards, postscript } = parseCardSections(m.content);
                    // If there are no #### card sections, render directly on the background (no card wrapper)
                    if (cards.length === 0) {
                      return (
                        <div>
                          <div
                            className="prose prose-sm prose-neutral max-w-none leading-6 text-[15px] prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold prose-h1:text-[19px] prose-h2:text-[17px] prose-h3:text-[15px]"
                            onClick={(e) => {
                              // Intercept clicks on profile links
                              const target = e.target as HTMLElement;
                              if (target.tagName === 'A' && target.classList.contains('profile-link')) {
                                e.preventDefault();
                                const href = target.getAttribute('href');
                                if (href) {
                                  navigate(href);
                                }
                              }
                            }}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                          />
                          <div className="mt-2 flex items-center justify-end gap-3 text-foreground/60 text-[12px]">
                            <button onClick={() => handleCopy(m.content)} className="inline-flex items-center gap-1 hover:text-foreground"><Clipboard className="h-4 w-4" /></button>
                            <button onClick={() => handleFeedback(i, 'up')} className={`inline-flex items-center gap-1 hover:text-foreground ${liked.has(i) ? 'text-foreground' : ''}`}><ThumbsUp className="h-4 w-4" /></button>
                            <button onClick={() => handleFeedback(i, 'down')} className={`inline-flex items-center gap-1 hover:text-foreground ${disliked.has(i) ? 'text-foreground' : ''}`}><ThumbsDown className="h-4 w-4" /></button>
                            <button onClick={() => handleRetryMessage(i)} disabled={retryingIndex === i} className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50">
                              <span>{retryingIndex === i ? 'Retrying' : 'Retry'}</span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {preamble && (
                          <div
                            className="prose prose-sm prose-neutral max-w-none leading-6 text-[15px] prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.tagName === 'A' && target.classList.contains('profile-link')) {
                                e.preventDefault();
                                const href = target.getAttribute('href');
                                if (href) navigate(href);
                              }
                            }}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(preamble) }}
                          />
                        )}
                        <div className="space-y-2">
                          {cards.map((card, idx) => {
                            const cardId = `card-${i}-${idx}`;
                            const isExpanded = expandedCards.has(cardId);
                            const { preview, dropdown, url } = parseCardWithDropdown(card);
                            const bubbleBg = '#F1E9DA';
                            
                            return (
                              <div key={idx} className="overflow-hidden">
                                <button
                                  onClick={() => {
                                    setExpandedCards(prev => {
                                      const next = new Set(prev);
                                      if (next.has(cardId)) {
                                        next.delete(cardId);
                                      } else {
                                        next.add(cardId);
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`w-full text-left border border-border/50 px-4 py-2 transition-all duration-300 hover:border-border/80 cursor-pointer ${
                                    isExpanded ? 'rounded-t-xl' : 'rounded-xl'
                                  }`}
                                  style={{ 
                                    backgroundColor: bubbleBg, 
                                    background: 'linear-gradient(135deg, #F1E9DA 0%, #F5F0E8 100%)'
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div
                                      className="flex-1 prose prose-sm prose-neutral max-w-none leading-snug text-[15px] prose-headings:mt-0 prose-headings:mb-0 prose-h3:text-[17px] prose-h3:font-semibold prose-h3:text-gray-900 prose-p:my-0.5 prose-ul:my-0 prose-ol:my-0 prose-li:my-0 prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-gray-800"
                                      dangerouslySetInnerHTML={{ __html: renderMarkdown(preview) }}
                                    />
                                    <ChevronDown 
                                      className={`h-4 w-4 text-gray-600 transition-transform duration-300 flex-shrink-0 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </div>
                                </button>
                                <div 
                                  className={`border-x border-b border-border/50 rounded-b-xl transition-all duration-300 origin-top ${
                                    isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 border-transparent'
                                  }`}
                                  style={{ 
                                    backgroundColor: bubbleBg,
                                    background: 'linear-gradient(135deg, #F1E9DA 0%, #F5F0E8 100%)'
                                  }}
                                >
                                  {dropdown && (
                                    <div 
                                      className={`px-4 py-3 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
                                      onClick={(e) => {
                                        // Intercept clicks on profile links
                                        const target = e.target as HTMLElement;
                                        if (target.classList.contains('profile-link')) {
                                          e.preventDefault();
                                          const href = target.getAttribute('href');
                                          if (href) {
                                            navigate(href);
                                          }
                                        }
                                      }}
                                    >
                                      <div
                                        className="prose prose-sm prose-neutral max-w-none leading-snug text-[15px] prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-a:text-blue-600 prose-a:font-medium prose-strong:font-semibold prose-strong:text-gray-800"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(dropdown, true) }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {postscript && (
                          <div
                            className="prose prose-sm prose-neutral max-w-none leading-6 text-[15px] prose-headings:mt-0 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.tagName === 'A' && target.classList.contains('profile-link')) {
                                e.preventDefault();
                                const href = target.getAttribute('href');
                                if (href) navigate(href);
                              }
                            }}
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(postscript) }}
                          />
                        )}
                        <div className="mt-1 flex items-center justify-end gap-3 text-foreground/60 text-[12px]">
                          <button onClick={() => handleCopy(m.content)} className="inline-flex items-center gap-1 hover:text-foreground"><Clipboard className="h-4 w-4" /></button>
                          <button onClick={() => handleFeedback(i, 'up')} className={`inline-flex items-center gap-1 hover:text-foreground ${liked.has(i) ? 'text-foreground' : ''}`}><ThumbsUp className="h-4 w-4" /></button>
                          <button onClick={() => handleFeedback(i, 'down')} className={`inline-flex items-center gap-1 hover:text-foreground ${disliked.has(i) ? 'text-foreground' : ''}`}><ThumbsDown className="h-4 w-4" /></button>
                          <button onClick={() => handleRetryMessage(i)} disabled={retryingIndex === i} className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50">
                            <span>{retryingIndex === i ? 'Retrying' : 'Retry'}</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
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
                    if (e.key === 'Enter' && !e.shiftKey) {
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
                  <ChevronRight className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-2xl mt-2 space-y-1">
              <button
                onClick={() => navigate(user ? '/profile' : '/auth')}
                className="w-full rounded-md border border-border bg-white px-4 py-1 text-[12px] text-foreground/70 shadow-sm hover:bg-white"
              >
                {profileData ? '✓ Profile Loaded - Edit Context' : 'Add Profile Context'}
              </button>
              {profileData && (
                <div className="text-center text-[10px] text-foreground/50">
                  Profile active: {profileData.gpa ? `GPA ${profileData.gpa}` : ''} {profileData.sat ? `SAT ${profileData.sat}` : ''} {profileData.activities?.filter(a => a.name || a.description).length || 0} activities
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* floating chat removed per request */}
      </div>
    </SidebarProvider>
  );
};

export default Index;
