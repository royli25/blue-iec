-- Enable pgcrypto (for gen_random_uuid) and pgvector
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Master content table for RAG chunks
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  kind text not null, -- 'rubric', 'exemplar', 'taxonomy', 'playbook', 'pref'
  title text,
  body text not null,
  metadata jsonb not null default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists kb_chunks_embedding_ivfflat on public.kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists kb_chunks_field_idx on public.kb_chunks ((metadata->>'field'));
create index if not exists kb_chunks_city_idx on public.kb_chunks ((metadata->>'city'));

-- Golden labeled opportunities / exemplars
create table if not exists public.kb_exemplars (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null,
  org text,
  field text,
  city text,
  label text not null, -- 'strong', 'weak', 'spam'
  reasons text,
  features jsonb,
  embedding vector(1536),
  created_at timestamptz default now()
);

create index if not exists kb_exemplars_embedding_ivfflat on public.kb_exemplars using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Runtime cache tables
create table if not exists public.opportunities_raw (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  url_hash text not null unique,
  domain text,
  title text,
  html_raw text,
  extracted_json jsonb,
  fetched_at timestamptz default now()
);

create table if not exists public.opportunities_scored (
  id uuid primary key default gen_random_uuid(),
  url_hash text not null references public.opportunities_raw(url_hash),
  query_context jsonb not null,
  rubric_json jsonb not null,
  scores jsonb not null,
  score_total numeric not null,
  justification text not null,
  risk text,
  source text not null,
  created_at timestamptz default now()
);


