create table if not exists public.application_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_contexts_user_unique unique (user_id)
);

drop trigger if exists set_application_contexts_updated_at on public.application_contexts;
create trigger set_application_contexts_updated_at
before update on public.application_contexts
for each row execute function public.set_updated_at();

alter table public.application_contexts enable row level security;

drop policy if exists "Users select own application_contexts" on public.application_contexts;
create policy "Users select own application_contexts" on public.application_contexts for select using (auth.uid() = user_id);

drop policy if exists "Users upsert own application_contexts" on public.application_contexts;
create policy "Users upsert own application_contexts" on public.application_contexts for insert with check (auth.uid() = user_id);
create policy "Users update own application_contexts" on public.application_contexts for update using (auth.uid() = user_id);

