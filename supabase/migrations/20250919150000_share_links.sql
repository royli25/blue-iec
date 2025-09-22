-- Shareable links to expose snapshots publicly via token
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('application_context','profile_details')),
  resource_id uuid,
  token text not null unique,
  title text,
  snapshot jsonb,
  is_revoked boolean not null default false,
  expires_at timestamptz,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- keep updated_at fresh (reuses public.set_updated_at if present)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_share_links_updated_at'
  ) then
    create trigger set_share_links_updated_at
    before update on public.share_links
    for each row execute function public.set_updated_at();
  end if;
end$$;

alter table public.share_links enable row level security;

-- Owner can manage their links
drop policy if exists "share_links_owner_all" on public.share_links;
create policy "share_links_owner_all"
  on public.share_links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Function to fetch a share snapshot by token (publicly accessible)
create or replace function public.get_share_snapshot(p_token text)
returns table(title text, snapshot jsonb, created_at timestamptz) as $$
begin
  return query
  select s.title, s.snapshot, s.created_at
  from public.share_links s
  where s.token = p_token
    and s.is_revoked = false
    and (s.expires_at is null or s.expires_at > now());
end;
$$ language plpgsql security definer;

grant execute on function public.get_share_snapshot(text) to anon, authenticated;



