import type { QueryContext, RagBundle, ScoredCandidate } from "./types";

type PersistInput = {
  fetched: { url: string; title?: string; html?: string; text?: string }[];
  scored: ScoredCandidate[];
  ctx: QueryContext;
  rag: RagBundle;
};

export async function persist(_input: PersistInput): Promise<void> {
  // Placeholder: no-op for scaffold. Replace with Supabase client writes.
}


