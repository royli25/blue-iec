import { CHAT_COLORS } from "@/lib/chat-constants";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div
      className="rounded-xl border border-border/70 shadow-sm backdrop-blur-md px-4 py-3"
      style={{ backgroundColor: CHAT_COLORS.userMessage }}
    >
      <div className="whitespace-pre-wrap leading-relaxed text-[15px] text-gray-800 font-medium">
        {content}
      </div>
    </div>
  );
}

