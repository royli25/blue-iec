-- Create chat_sessions table to store conversation history
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Chat',
  messages jsonb not null default '[]', -- Array of ChatMessage objects
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add index for faster queries
create index if not exists chat_sessions_user_id_idx on public.chat_sessions(user_id);
create index if not exists chat_sessions_updated_at_idx on public.chat_sessions(updated_at desc);

-- Auto-update the updated_at timestamp
drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.chat_sessions enable row level security;

-- RLS policies
drop policy if exists "Users can select own chat_sessions" on public.chat_sessions;
create policy "Users can select own chat_sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own chat_sessions" on public.chat_sessions;
create policy "Users can insert own chat_sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own chat_sessions" on public.chat_sessions;
create policy "Users can update own chat_sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own chat_sessions" on public.chat_sessions;
create policy "Users can delete own chat_sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

