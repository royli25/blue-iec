import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseCardSections(source: string): {
  preamble: string;
  cards: string[];
  postscript: string;
} {
  const lines = source.split(/\r?\n/);
  const cards: string[] = [];
  const preambleLines: string[] = [];
  const postscriptLines: string[] = [];

  let inCard = false;
  let seenFirstDelimiter = false;
  let currentCard: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine;
    const isDelimiter = line.trim() === "####";

    if (isDelimiter) {
      seenFirstDelimiter = true;
      if (!inCard) {
        inCard = true;
        currentCard = [];
      } else {
        inCard = false;
        const content = currentCard.join("\n").trim();
        if (content.length > 0) {
          cards.push(content);
        }
        currentCard = [];
      }
      continue;
    }

    if (inCard) {
      currentCard.push(line);
    } else if (!seenFirstDelimiter) {
      preambleLines.push(line);
    } else {
      postscriptLines.push(line);
    }
  }

  if (inCard) {
    const content = currentCard.join("\n").trim();
    if (content.length > 0) {
      cards.push(content);
    }
  }

  return {
    preamble: preambleLines.join("\n").trim(),
    cards,
    postscript: postscriptLines.join("\n").trim(),
  };
}

export function extractFirstUrl(markdown: string): string | null {
  const linkSyntaxMatch = markdown.match(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/i);
  if (linkSyntaxMatch && linkSyntaxMatch[1]) return linkSyntaxMatch[1];
  const bareUrlMatch = markdown.match(/(https?:\/\/[\w\-._~:/?#%[@!$&'()*+,;=]+)|(www\.[\w\-._~:/?#%[@!$&'()*+,;=]+)/i);
  if (bareUrlMatch) {
    const url = bareUrlMatch[0];
    return url.startsWith("http") ? url : `https://${url}`;
  }
  return null;
}
