import { supabase } from '@/integrations/supabase/client';

async function embedQuery(query: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data[0].embedding as number[];
}

export type KbMatch = {
  id: string;
  kind: string;
  title: string | null;
  body: string;
  metadata: any;
  similarity: number;
};

export async function matchKb(query: string, filter: Record<string, any> = {}, k = 5): Promise<KbMatch[]> {
  const embedding = await embedQuery(query);
  // Cast to any to avoid strict typing on generated types (function not in local types)
  const { data, error } = await (supabase as any).rpc('match_kb_chunks', {
    query_embedding: embedding,
    match_count: k,
    filter,
  });
  if (error) throw error;
  return data as KbMatch[];
}

export type KbContextOptions = {
  k?: number;
  maxCharsPerChunk?: number;
  maxTotalChars?: number;
  header?: string;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function formatOne(match: KbMatch, index: number, maxCharsPerChunk: number, includeMetadata: boolean): string {
  const title = match.title || truncate(match.body, 80);
  const snippet = truncate(match.body.replace(/\s+/g, ' ').trim(), maxCharsPerChunk);
  const lines: string[] = [];
  lines.push(`[KB ${index}] ${title}`);
  lines.push(snippet);
  if (includeMetadata) {
    const url = match.metadata?.url || match.metadata?.source || '';
    if (url) lines.push(`Source: ${url}`);
  }
  return lines.join('\n');
}

export async function buildKbContextBlock(
  query: string,
  options: KbContextOptions = {}
): Promise<{ block: string; matches: KbMatch[] }> {
  const {
    k = 5,
    maxCharsPerChunk = 500,
    maxTotalChars = 1800,
    header = 'KB Context',
    includeMetadata = true,
    filter = {},
  } = options;

  let matches: KbMatch[] = [];
  try {
    matches = await matchKb(query, filter, k);
  } catch {
    return { block: '', matches: [] };
  }

  const parts: string[] = [];
  parts.push(header);
  let total = 0;
  for (let i = 0; i < matches.length; i++) {
    const formatted = formatOne(matches[i], i + 1, maxCharsPerChunk, includeMetadata);
    if (total + formatted.length > maxTotalChars) break;
    parts.push(formatted);
    parts.push('---');
    total += formatted.length;
  }

  // Remove trailing separator
  if (parts[parts.length - 1] === '---') parts.pop();

  const block = parts.join('\n');
  return { block, matches };
}



