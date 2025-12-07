create extension if not exists "uuid-ossp";

-- Helper used by policies to identify admins
create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
as $$
  select check_user_id is not null
    and exists (
      select 1
      from public."adminUsers" au
      where au.user_id = check_user_id
        and coalesce(au.role, 'user') = 'admin'
    );
$$;

comment on function public.is_admin is 'Helper used by RLS policies to check if the current auth.uid() belongs to an admin.';

create table if not exists public.homepage_hero_content (
  id uuid primary key default uuid_generate_v4(),
  singleton_key text not null default 'hero',
  heading text not null,
  subheading text not null,
  cta_label text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint homepage_hero_content_singleton unique (singleton_key)
);

create or replace function public.homepage_hero_content_set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create or replace function public.homepage_hero_content_set_created_at()
returns trigger as $$
begin
  if new.created_at is null then
    new.created_at = timezone('utc', now());
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists homepage_hero_content_set_created_at on public.homepage_hero_content;
create trigger homepage_hero_content_set_created_at
before insert on public.homepage_hero_content
for each row execute function public.homepage_hero_content_set_created_at();

drop trigger if exists homepage_hero_content_set_updated_at on public.homepage_hero_content;
create trigger homepage_hero_content_set_updated_at
before update on public.homepage_hero_content
for each row execute function public.homepage_hero_content_set_updated_at();

alter table public.homepage_hero_content enable row level security;

drop policy if exists "Public read homepage_hero_content" on public.homepage_hero_content;
create policy "Public read homepage_hero_content"
  on public.homepage_hero_content
  for select
  using (true);

drop policy if exists "Admins manage homepage_hero_content" on public.homepage_hero_content;
create policy "Admins manage homepage_hero_content"
  on public.homepage_hero_content
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.homepage_hero_content (singleton_key, heading, subheading, cta_label)
values (
  'hero',
  'Visuelle Exzellenz. Digitale Präzision.',
  'DS_Capture vereint Design, Strategie und Technologie zu einem klaren Markenauftritt.',
  'Jetzt Kontaktieren'
)
on conflict (singleton_key) do update set
  heading = excluded.heading,
  subheading = excluded.subheading,
  cta_label = excluded.cta_label;
