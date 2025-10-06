-- Create a helper function to vector-search kb_chunks by cosine similarity
create or replace function public.match_kb_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  filter jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  metadata jsonb,
  similarity float
)
language sql stable as $$
  select
    kc.id,
    kc.kind,
    kc.title,
    kc.body,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.kb_chunks kc
  where
    (filter ? 'kind'   is false or kc.kind = filter->>'kind') and
    (filter ? 'field'  is false or kc.metadata->>'field' = filter->>'field') and
    (filter ? 'city'   is false or kc.metadata->>'city'  = filter->>'city')
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;





