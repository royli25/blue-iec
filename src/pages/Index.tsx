import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { createChatCompletion, type ChatMessage } from "@/integrations/openai/client";
import { SYSTEM_HOME_CHAT } from "@/config/prompts";
import { useNavigate } from "react-router-dom";
import { useProfileContext } from '@/hooks/useProfileContext';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { createChatSession, updateChatSession, type ChatSession } from "@/lib/chat-utils";
import { retrieveChatContext, buildSystemPromptWithContext } from "@/lib/chat-retrieval";
import { UserMessage } from "@/components/chat/UserMessage";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { PLACEHOLDER_PROMPTS, CHINESE_PLACEHOLDER_PROMPTS, CHAT_CONFIG, CHAT_COLORS } from "@/lib/chat-constants";

const Index = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getContextualSystemPrompt, profileData } = useProfileContext();
  const { language, t } = useTranslation();
  
  // State
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
  const [debugContexts, setDebugContexts] = useState<Map<number, string>>(new Map());
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);

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
  // Rotating placeholder text - dynamic based on language
  const currentPlaceholders = language === 'zh' ? CHINESE_PLACEHOLDER_PROMPTS : PLACEHOLDER_PROMPTS;
  
  // Rotate placeholder prompts
  useEffect(() => {
    if (isFocused || query.length > 0) return;
    const interval = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setPromptIndex((i) => (i + 1) % currentPlaceholders.length);
        setPhase('in');
      }, CHAT_CONFIG.placeholderTransitionDuration);
    }, CHAT_CONFIG.placeholderRotationInterval);
    return () => clearInterval(interval);
  }, [isFocused, query.length, currentPlaceholders.length]);
  const rotatingPlaceholder = currentPlaceholders[promptIndex];
  const placeholderClass = query.length > 0 ? '' : (phase === 'in' ? 'placeholder-in' : 'placeholder-out');

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
      // Get base system prompt with user profile context
      const contextualSystemPrompt = getContextualSystemPrompt(SYSTEM_HOME_CHAT);

      // Retrieve relevant context (student profiles + knowledge base)
      const { studentProfilesBlock, kbBlock, schoolNames } = await retrieveChatContext(text, profileData);

      // Build enhanced system prompt with retrieved context
      const systemWithContext = buildSystemPromptWithContext(
        contextualSystemPrompt,
        studentProfilesBlock,
        kbBlock,
        schoolNames,
        language
      );

      // Generate AI response
      const content = await createChatCompletion([
        { role: 'system', content: systemWithContext },
        ...nextMessages,
      ]);
      
      // Store debug context
      const messageIndex = nextMessages.length;
      setDebugContexts((prev) => {
        const next = new Map(prev);
        next.set(messageIndex, studentProfilesBlock || 'No student profiles retrieved');
        return next;
      });
      
      const updatedMessages = [...nextMessages, { role: 'assistant', content }];
      setMessages(updatedMessages);
      
      // Auto-save to database if user is logged in
      if (user) {
        if (currentChatSession) {
          await updateChatSession(currentChatSession.id, updatedMessages);
        } else {
          const newSession = await createChatSession(updatedMessages);
          if (newSession) {
            setCurrentChatSession(newSession);
            setSidebarRefreshTrigger(prev => prev + 1);
          }
        }
      }
    } catch (err: any) {
      toast({ 
        title: 'Search failed', 
        description: err?.message || 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };
  const handleNewChat = () => {
    setMessages([]);
    setQuery("");
    setCurrentChatSession(null);
    // Clear sessionStorage too
    sessionStorage.removeItem('home.messages.v1');
    sessionStorage.removeItem('home.query.v1');
  };

  const handleLoadChat = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentChatSession(session);
    setQuery("");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar 
        onNewChat={handleNewChat} 
        onLoadChat={handleLoadChat}
        currentChatId={currentChatSession?.id}
        refreshTrigger={sidebarRefreshTrigger}
      />
      <div className="relative h-screen w-full flex flex-col overflow-hidden bg-white">
      {/* Show header when in chat mode */}
      {messages.length > 0 && <PageHeader />}
      
      <div className="flex-1 relative overflow-hidden">
      {/* top-right auth button / email - only show on landing */}
      {messages.length === 0 && (
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
      )}
      {/* background: clean white (no grid/tan) */}
      <div className="absolute inset-0 bg-white" />

      {/* Landing vs Chat layout */}
      {messages.length === 0 ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6">
          {/* logo above search */}
          <div className="mx-auto max-w-3xl mb-6 flex justify-center">
            <img src="/long_logo.svg" alt="BluePrint" className="h-8 object-contain" />
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
                title={loading ? t('home.sending') : t('home.send')}
              >
                <ChevronRight className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
          {/* two wide option boxes (50% width each) */}
          <div className="mx-auto mt-3 max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <button onClick={() => navigate(user ? '/profile' : '/auth')} className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">{t('home.provideProfileContext')}</button>
            <button onClick={() => navigate('/technology')} className="w-full rounded-md border border-border bg-white/70 px-4 py-1 text-foreground/70 backdrop-blur-sm shadow-sm hover:bg-white">
              {t('home.understandTechnology')}
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 overflow-y-auto pt-6 pb-[200px] px-6">
            <div className="mx-auto max-w-2xl space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-foreground/90' : 'text-foreground'}>
                  {m.role === 'user' ? (
                    <UserMessage content={m.content} />
                  ) : (
                    <AssistantMessage
                      content={m.content}
                      messageIndex={i}
                      expandedCards={expandedCards}
                      onToggleCard={(cardId) => {
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
                      onProfileLinkClick={(href) => navigate(href)}
                      onCopy={() => handleCopy(m.content)}
                      onLike={() => handleFeedback(i, 'up')}
                      onDislike={() => handleFeedback(i, 'down')}
                      onRetry={() => handleRetryMessage(i)}
                      isLiked={liked.has(i)}
                      isDisliked={disliked.has(i)}
                      isRetrying={retryingIndex === i}
                      debugContext={debugContexts.get(i)}
                    />
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-foreground">
                  <div 
                    className="rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3 inline-block" 
                    style={{ backgroundColor: CHAT_COLORS.assistantMessage }}
                  >
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
          <div className="px-6 pb-4 z-20">
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
      </div>
    </SidebarProvider>
  );
};

export default Index;
