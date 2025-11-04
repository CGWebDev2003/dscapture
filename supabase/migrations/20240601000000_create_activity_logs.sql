create extension if not exists "uuid-ossp";

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default timezone('utc', now()),
  action text not null,
  description text,
  context text,
  user_id uuid,
  user_email text,
  entity_type text,
  entity_id text,
  metadata jsonb,
  constraint activity_logs_context_check
    check (context is null or context in ('public', 'admin', 'system'))
);

create index if not exists activity_logs_user_id_idx on public.activity_logs(user_id);
create index if not exists activity_logs_context_idx on public.activity_logs(context);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at);
