/*
  Usage:
    SUPABASE_URL=... \
    SUPABASE_SERVICE_ROLE_KEY=... \
    OPENAI_API_KEY=... \
    INPUT_PATH=./data/yale_podcast_chunks_full.jsonl \
    bun run tsx scripts/ingest_jsonl.ts

  Each line of INPUT_PATH should be a JSON object. Adjust `mapRecord` below to fit your schema.
*/

import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const INPUT_PATH = process.env.INPUT_PATH || './data/yale_podcast_chunks_full.jsonl';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY are required.');
  process.exit(1);
}

type KbRow = {
  kind: string;
  title: string | null;
  body: string;
  metadata: Record<string, any>;
  embedding?: number[];
};

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function embedBatch(inputs: string[]): Promise<number[][]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: inputs }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.data.map((d: any) => d.embedding as number[]);
}

function mapRecord(rec: any): KbRow | null {
  // Prefer rich content fields for body; fall back to episode_title if it carries transcript-like text
  const longCandidate: string = (
    rec.transcript || rec.summary || rec.content || rec.text || rec.chunk || rec.body || rec.episode_title || ''
  );
  const body: string = typeof longCandidate === 'string' ? longCandidate : String(longCandidate ?? '');
  if (!body.trim()) return null;

  // Derive a concise title: use explicit title if present, otherwise first line/sentence of body
  const explicitTitle: string | null = rec.title || rec.name || null;
  let derivedTitle = explicitTitle || rec.episode_title || null;
  if (!derivedTitle) {
    const firstLine = body.split(/\r?\n/)[0] || body.slice(0, 160);
    derivedTitle = firstLine.length > 160 ? (firstLine.slice(0, 157) + '…') : firstLine;
  } else if (derivedTitle.length > 160) {
    derivedTitle = derivedTitle.slice(0, 157) + '…';
  }

  const kind = rec.kind || 'document';
  const metadata = {
    source: rec.source || 'yale_podcast',
    url: rec.url || rec.link || undefined,
    episode_id: rec.episode_id || undefined,
    chunk_id: rec.chunk_id || undefined,
    topics: rec.topics || undefined,
    ...rec.metadata,
  } as Record<string, any>;

  return { kind, title: derivedTitle, body, metadata };
}

async function main() {
  const stream = fs.createReadStream(INPUT_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const batch: KbRow[] = [];
  const BATCH_SIZE = 64;
  let lineNum = 0;

  const flush = async () => {
    if (batch.length === 0) return;
    const embeddings = await embedBatch(batch.map(b => b.body));
    const rows = batch.map((b, i) => ({ ...b, embedding: embeddings[i] }));
    const { error } = await sb.from('kb_chunks').insert(rows);
    if (error) {
      console.error('Insert error:', error);
      process.exitCode = 1;
    }
    batch.length = 0;
  };

  for await (const line of rl) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const rec = JSON.parse(trimmed);
      const mapped = mapRecord(rec);
      if (!mapped) continue;
      batch.push(mapped);
      if (batch.length >= BATCH_SIZE) {
        await flush();
      }
    } catch (e) {
      console.warn(`Skipping invalid JSON on line ${lineNum}`);
    }
  }

  await flush();
  console.log('Ingestion complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



