import type { QueryContext, RagBundle, ScoredCandidate } from "./types";

export async function justify(scored: ScoredCandidate[], _rag: RagBundle, _ctx: QueryContext): Promise<ScoredCandidate[]> {
  // Placeholder: add simple template; later call OpenAI with rubric snippets
  return scored.map((s) => ({
    ...s,
    why_strong: s.title ? `Relevant and credible program for ${s.title}.` : 'Relevant and credible program.',
    watch_out: 'Confirm current availability and deadlines.',
    confidence: s.score_total > 8 ? 'high' : 'medium',
  }));
}


