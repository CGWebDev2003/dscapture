create extension if not exists "uuid-ossp";

create table if not exists public.homepage_photographer_intro (
  id uuid primary key default uuid_generate_v4(),
  singleton_key text not null default 'homepage',
  heading text not null,
  subheading text,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint homepage_photographer_intro_singleton unique (singleton_key)
);

create or replace function public.homepage_photographer_intro_set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists homepage_photographer_intro_set_updated_at on public.homepage_photographer_intro;
create trigger homepage_photographer_intro_set_updated_at
before update on public.homepage_photographer_intro
for each row execute function public.homepage_photographer_intro_set_updated_at();

insert into public.homepage_photographer_intro (singleton_key, heading, subheading, body)
values (
  'homepage',
  'Der Fotograf hinter DS_Capture',
  'Daniel Szymański vereint künstlerische Vision und strategische Markenführung.',
  'Mit über einem Jahrzehnt Erfahrung in Fotografie, Regie und visueller Kommunikation entwickelt Daniel Szymański Bildwelten, die Markenidentitäten erlebbar machen. Von der ersten Idee bis zur finalen Produktion begleitet er Unternehmen als kreativer Sparringspartner – analytisch, präzise und mit Gespür für Emotionen.'
)
on conflict (singleton_key) do update set
  heading = excluded.heading,
  subheading = excluded.subheading,
  body = excluded.body;
