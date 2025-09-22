import type { ScoredCandidate } from "./types";

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export function dedupeAndLimit(list: ScoredCandidate[]): ScoredCandidate[] {
  const byDomain = new Map<string, ScoredCandidate>();
  const sorted = [...list].sort((a,b) => b.score_total - a.score_total);
  for (const item of sorted) {
    const key = domainOf(item.url);
    if (!byDomain.has(key)) byDomain.set(key, item);
    if (byDomain.size >= 12) break;
  }
  return Array.from(byDomain.values());
}


