import { RagBundle, QueryContext, RagChunk } from "./types";

// Placeholder: in Edge Functions, use service role via env to query Postgres
export async function retrieveKnowledge(ctx: QueryContext): Promise<RagBundle> {
  // For scaffold: return empty arrays; later replace with pgvector cosine queries
  const empty: RagChunk[] = [];
  return { rubrics: empty, exemplars: empty, playbook: empty, prefs: ctx.prefs };
}


