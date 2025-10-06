-- Ensure required extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- RAG chunks table (1536-dim to match text-embedding-3-small)
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text,
  body text not null,
  metadata jsonb not null default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Vector index for fast ANN search
create index if not exists kb_chunks_embedding_ivfflat
  on public.kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Helpful metadata indexes (optional, no-op if already exist)
create index if not exists kb_chunks_field_idx on public.kb_chunks ((metadata->>'field'));
create index if not exists kb_chunks_city_idx  on public.kb_chunks ((metadata->>'city'));

-- Reload PostgREST schema cache so API sees the new table immediately
select pg_notify('pgrst', 'reload schema');





