import { ChevronDown } from "lucide-react";
import { CHAT_COLORS, CARD_PROSE_CLASSES, DROPDOWN_PROSE_CLASSES } from "@/lib/chat-constants";
import renderMarkdownToHtml from "@/lib/markdown";

interface CollapsibleCardProps {
  preview: string;
  dropdown: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onProfileLinkClick: (href: string) => void;
}

export function CollapsibleCard({ 
  preview, 
  dropdown, 
  isExpanded, 
  onToggle,
  onProfileLinkClick 
}: CollapsibleCardProps) {
  return (
    <div className="overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full text-left border border-border/50 px-4 py-2 transition-all duration-300 hover:border-border/80 cursor-pointer ${
          isExpanded ? 'rounded-t-xl' : 'rounded-xl'
        }`}
        style={{ 
          backgroundColor: CHAT_COLORS.assistantMessage, 
          background: CHAT_COLORS.assistantMessageGradient
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div
            className={`flex-1 ${CARD_PROSE_CLASSES}`}
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(preview) }}
          />
          <ChevronDown 
            className={`h-4 w-4 text-gray-600 transition-transform duration-300 flex-shrink-0 mt-1 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      <div 
        className={`border-x border-b border-border/50 rounded-b-xl transition-all duration-300 origin-top ${
          isExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 border-transparent'
        }`}
        style={{ 
          backgroundColor: CHAT_COLORS.assistantMessage,
          background: CHAT_COLORS.assistantMessageGradient
        }}
      >
        {dropdown && (
          <div 
            className={`px-4 py-3 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains('profile-link')) {
                e.preventDefault();
                const href = target.getAttribute('href');
                if (href) onProfileLinkClick(href);
              }
            }}
          >
            <div
              className={DROPDOWN_PROSE_CLASSES}
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(dropdown, true) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

