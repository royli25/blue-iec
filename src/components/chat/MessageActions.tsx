import { Clipboard, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";

interface MessageActionsProps {
  onCopy: () => void;
  onLike: () => void;
  onDislike: () => void;
  onRetry: () => void;
  isLiked: boolean;
  isDisliked: boolean;
  isRetrying: boolean;
}

export function MessageActions({
  onCopy,
  onLike,
  onDislike,
  onRetry,
  isLiked,
  isDisliked,
  isRetrying,
}: MessageActionsProps) {
  return (
    <div className="mt-2 flex items-center justify-end gap-3 text-foreground/60 text-[12px]">
      <button 
        onClick={onCopy} 
        className="inline-flex items-center gap-1 hover:text-foreground"
        title="Copy to clipboard"
      >
        <Clipboard className="h-4 w-4" />
      </button>
      <button 
        onClick={onLike} 
        className={`inline-flex items-center gap-1 hover:text-foreground ${
          isLiked ? 'text-foreground' : ''
        }`}
        title="Like"
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button 
        onClick={onDislike} 
        className={`inline-flex items-center gap-1 hover:text-foreground ${
          isDisliked ? 'text-foreground' : ''
        }`}
        title="Dislike"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
      <button 
        onClick={onRetry} 
        disabled={isRetrying} 
        className="inline-flex items-center gap-1 hover:text-foreground disabled:opacity-50"
        title="Retry"
      >
        <span>{isRetrying ? 'Retrying' : 'Retry'}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}

