import { PROSE_CLASSES } from "@/lib/chat-constants";
import { parseCardSections, parseCardWithDropdown } from "@/lib/utils";
import renderMarkdownToHtml from "@/lib/markdown";
import { CollapsibleCard } from "./CollapsibleCard";
import { MessageActions } from "./MessageActions";

interface AssistantMessageProps {
  content: string;
  messageIndex: number;
  expandedCards: Set<string>;
  onToggleCard: (cardId: string) => void;
  onProfileLinkClick: (href: string) => void;
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
  onRetry: () => void;
  isLiked: boolean;
  isDisliked: boolean;
  isRetrying: boolean;
  debugContext?: string;
}

export function AssistantMessage({
  content,
  messageIndex,
  expandedCards,
  onToggleCard,
  onProfileLinkClick,
  onCopy,
  onLike,
  onDislike,
  onRetry,
  isLiked,
  isDisliked,
  isRetrying,
  debugContext,
}: AssistantMessageProps) {
  const { preamble, cards, postscript } = parseCardSections(content);

  // If there are no card sections, render directly without card wrapper
  if (cards.length === 0) {
    return (
      <div>
        <div
          className={PROSE_CLASSES}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.classList.contains('profile-link')) {
              e.preventDefault();
              const href = target.getAttribute('href');
              if (href) onProfileLinkClick(href);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
        />
        <MessageActions
          onCopy={onCopy}
          onLike={onLike}
          onDislike={onDislike}
          onRetry={onRetry}
          isLiked={isLiked}
          isDisliked={isDisliked}
          isRetrying={isRetrying}
        />
        {debugContext && (
          <details className="mt-3 rounded-md border border-red-300 bg-red-50 p-3">
            <summary className="cursor-pointer text-[11px] font-semibold text-red-700">
              🐛 DEBUG: Profile Context Sent to AI
            </summary>
            <pre className="mt-2 overflow-x-auto text-[10px] text-red-900 whitespace-pre-wrap">
              {debugContext}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Render with collapsible cards
  return (
    <div className="space-y-3">
      {preamble && (
        <div
          className={PROSE_CLASSES}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.classList.contains('profile-link')) {
              e.preventDefault();
              const href = target.getAttribute('href');
              if (href) onProfileLinkClick(href);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(preamble) }}
        />
      )}
      <div className="space-y-2">
        {cards.map((card, idx) => {
          const cardId = `card-${messageIndex}-${idx}`;
          const isExpanded = expandedCards.has(cardId);
          const { preview, dropdown } = parseCardWithDropdown(card);
          
          return (
            <CollapsibleCard
              key={idx}
              preview={preview}
              dropdown={dropdown}
              isExpanded={isExpanded}
              onToggle={() => onToggleCard(cardId)}
              onProfileLinkClick={onProfileLinkClick}
            />
          );
        })}
      </div>
      {postscript && (
        <div
          className={PROSE_CLASSES}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'A' && target.classList.contains('profile-link')) {
              e.preventDefault();
              const href = target.getAttribute('href');
              if (href) onProfileLinkClick(href);
            }
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(postscript) }}
        />
      )}
      <MessageActions
        onCopy={onCopy}
        onLike={onLike}
        onDislike={onDislike}
        onRetry={onRetry}
        isLiked={isLiked}
        isDisliked={isDisliked}
        isRetrying={isRetrying}
      />
      {debugContext && (
        <details className="mt-3 rounded-md border border-red-300 bg-red-50 p-3">
          <summary className="cursor-pointer text-[11px] font-semibold text-red-700">
            🐛 DEBUG: Profile Context Sent to AI
          </summary>
          <pre className="mt-2 overflow-x-auto text-[10px] text-red-900 whitespace-pre-wrap">
            {debugContext}
          </pre>
        </details>
      )}
    </div>
  );
}

