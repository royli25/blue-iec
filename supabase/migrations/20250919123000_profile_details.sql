-- Create table to store per-user profile details
create extension if not exists "pgcrypto";

create table if not exists public.profile_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grade_level text,
  demographic text,
  school text,
  gpa text,
  sat text,
  activities jsonb,         -- array of strings
  ap_exams jsonb,           -- array of objects { exam, score }
  awards jsonb,             -- array of objects { name, level }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_details_user_unique unique (user_id)
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profile_details_updated_at on public.profile_details;
create trigger set_profile_details_updated_at
before update on public.profile_details
for each row execute function public.set_updated_at();

-- RLS
alter table public.profile_details enable row level security;

drop policy if exists "Users can select own profile_details" on public.profile_details;
create policy "Users can select own profile_details"
  on public.profile_details for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile_details" on public.profile_details;
create policy "Users can insert own profile_details"
  on public.profile_details for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile_details" on public.profile_details;
create policy "Users can update own profile_details"
  on public.profile_details for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own profile_details" on public.profile_details;
create policy "Users can delete own profile_details"
  on public.profile_details for delete
  using (auth.uid() = user_id);


