// Edge Function: opportunities-search
// Orchestrates RAG-aware search-and-rank pipeline (SerpAPI + Firecrawl)

import type { Serve } from "./types";
import { retrieveKnowledge } from "./retrieveKnowledge";
import { planQueries } from "./planQueries";
import { searchSerp } from "./searchSerp";
import { fetchFirecrawl } from "./fetchFirecrawl";
import { buildCandidates } from "./candidateBuilder";
import { scoreCandidates } from "./score";
import { justify } from "./justify";
import { dedupeAndLimit } from "./dedupe";
import { persist } from "./persist";
import type { QueryContext, SearchResponse } from "./types";

export const serve: Serve = async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const body = await req.json().catch(() => ({}));
  const ctx: QueryContext = body?.query_context || body;
  if (!ctx || !ctx.field) return new Response('Invalid query_context', { status: 400 });

  const rag = await retrieveKnowledge(ctx);
  const queries = await planQueries(ctx, rag);
  const searchResults = await searchSerp(queries);
  const fetched = await fetchFirecrawl(searchResults);
  const candidates = await buildCandidates(fetched);
  const scored = await scoreCandidates(candidates, rag, ctx);
  const justified = await justify(scored, rag, ctx);
  const finalCards = dedupeAndLimit(justified);
  await persist({ fetched, scored: finalCards, ctx, rag });

  const resp: SearchResponse = {
    query_context: ctx,
    rag_bundle_digest: {
      rubric_ids: rag.rubrics.map((r) => r.id || '').filter(Boolean),
      exemplar_ids: rag.exemplars.map((e) => e.id || '').filter(Boolean),
      playbook_ids: rag.playbook.map((p) => p.id || '').filter(Boolean),
    },
    opportunities: finalCards.map((c) => ({
      title: c.title,
      org: c.org,
      location: c.location,
      remote: c.remote,
      deadline: c.deadline ?? null,
      time_commitment: c.time_commitment,
      cost: c.cost,
      audience: c.audience,
      application: c.application,
      impact_signals: c.impact_signals,
      score: Math.round(c.score_total),
      why_strong: c.why_strong,
      watch_out: c.watch_out,
      source: c.url,
      confidence: c.confidence || 'medium',
    })),
  };
  return new Response(JSON.stringify(resp), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

// Deno-style export for Supabase Edge Runtime
export default { fetch: serve } as any;


