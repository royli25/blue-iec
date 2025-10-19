-- Personal Blueprint tables and policies

create table if not exists public.personal_blueprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  content jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.personal_blueprints enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'personal_blueprints' and policyname = 'Allow select own personal_blueprints'
  ) then
    create policy "Allow select own personal_blueprints" on public.personal_blueprints for select
      using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'personal_blueprints' and policyname = 'Allow upsert own personal_blueprints'
  ) then
    create policy "Allow upsert own personal_blueprints" on public.personal_blueprints for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.personal_blueprint_todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null check (status in ('todo','done')) default 'todo',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personal_blueprint_todos_user_order_idx on public.personal_blueprint_todos(user_id, position, created_at);

alter table public.personal_blueprint_todos enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'personal_blueprint_todos' and policyname = 'Allow select own todos'
  ) then
    create policy "Allow select own todos" on public.personal_blueprint_todos for select
      using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'personal_blueprint_todos' and policyname = 'Allow modify own todos'
  ) then
    create policy "Allow modify own todos" on public.personal_blueprint_todos for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


