import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createChatCompletion } from "@/integrations/openai/client";
import { SYSTEM_CHATBOT } from "@/config/prompts";
import { SUGGESTIONS } from "@/config/suggestions";
import OrbGraphic from "@/components/OrbGraphic";
import renderMarkdownToHtml from "@/lib/markdown";
import { extractFirstUrl, parseCardSections } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Auto-scroll to bottom when messages change or when thinking
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  };
  useEffect(() => {
    scrollToBottom("auto");
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    try {
      setIsThinking(true);
      const content = await createChatCompletion([
        { role: "system", content: SYSTEM_CHATBOT },
        ...messages.map((m) => ({ role: m.isUser ? "user" : "assistant", content: m.text })),
        { role: "user", content: text },
      ]);

      const botResponse: Message = {
        id: Date.now() + 1,
        text: content,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: "There was an error contacting the AI service. Please add your API key to .env and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = () => void sendMessage(inputValue);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const showEmptyState = messages.length <= 1;
  // pick 5 random unique suggestions each load
  const suggestions = [...SUGGESTIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {/* grid background with right fade */}
        <div className="absolute inset-0 grid-bg opacity-90 mask-fade-right" />
        {/* radial blur focus, centered in left column (roughly mid of chat area) */}
        <div className="absolute left-[32.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] radial-blur-spot" />
        {showEmptyState ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <p className="text-sm text-muted-foreground">Hello there, how can I help you today?</p>
          </div>
        ) : (
          <ScrollArea className="absolute inset-0 p-4 pb-56 overflow-y-auto">
            <div className="mx-auto w-[80%] space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={message.isUser ? "flex justify-end" : "flex justify-start"}>
                  {message.isUser ? (
                    <div className="max-w-[60%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow-sm">
                      <p className="text-sm leading-6 whitespace-pre-line">{message.text}</p>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary" />
                        <span className="text-[13px] font-semibold text-primary">blue AI</span>
                      </div>
                      <div className="w-full rounded-2xl px-0 py-0">
                        {(() => {
                          const { preamble, cards, postscript } = parseCardSections(message.text);
                          const bubbleBg = 'transparent';
                          if (cards.length === 0) {
                            return (
                              <div
                                className="prose prose-sm prose-neutral max-w-none text-[15px] leading-8 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(message.text) }}
                              />
                            );
                          }
                          return (
                            <div className="space-y-3">
                              {preamble && (
                                <div
                                  className="prose prose-sm prose-neutral max-w-none text-[15px] leading-8 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(preamble) }}
                                />
                              )}
                              <div className="flex gap-3 overflow-x-auto pb-1">
                                {cards.map((card, idx) => {
                                  const href = extractFirstUrl(card);
                                  return (
                                    <a
                                      key={idx}
                                      href={href || undefined}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`block rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3 transition-colors flex-shrink-0 min-w-[280px] sm:min-w-[420px] ${href ? 'hover:bg-white/80' : ''}`}
                                      style={{ backgroundColor: '#F1E9DA', cursor: href ? 'pointer' as const : 'default' }}
                                    >
                                      <div
                                        className="prose prose-sm prose-neutral max-w-none text-[15px] leading-8 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(card) }}
                                      />
                                    </a>
                                  );
                                })}
                              </div>
                              {postscript && (
                                <div
                                  className="prose prose-sm prose-neutral max-w-none text-[15px] leading-8 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-a:text-blue-700 prose-strong:font-semibold"
                                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(postscript) }}
                                />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="w-full">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary" />
                      <span className="text-[13px] font-semibold text-primary">blue AI</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-card/80 border border-border px-3 py-2">
                      <span className="sr-only">Typing…</span>
                      <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce" style={{animationDelay: "0ms"}} />
                      <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce" style={{animationDelay: "150ms"}} />
                      <span className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce" style={{animationDelay: "300ms"}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Floating Input Bar */}
      {/* Suggestions Panel */}
      <div className="absolute inset-x-0 bottom-24 z-10 px-6">
        <div className="mx-auto w-[80%] rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md shadow-lg">
          <div className="divide-y divide-border/60">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Input Bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6">
        <div className="mx-auto w-[80%]">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full shadow-sm focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-slate-300"
            />
            <Button onClick={handleSendMessage} variant="default" className="rounded-full">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;