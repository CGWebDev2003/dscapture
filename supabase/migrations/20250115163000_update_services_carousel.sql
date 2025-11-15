-- Create a dedicated public bucket for service carousel assets
insert into storage.buckets (id, name, public)
values ('service-carousel', 'service-carousel', true)
on conflict (id) do nothing;

-- Ensure the services table can reference storage objects
alter table public.services
  add column if not exists image_path text;

-- Upsert the current set of services that power the carousel
insert into public.services as s (
  slug,
  label,
  headline,
  subline,
  info_title,
  info_paragraphs,
  info_bullet_points,
  gradient_start,
  gradient_end,
  image_path
) values
  (
    'events',
    'Events',
    'Dein Event. Deine Bühne. Deine Bilder.',
    'Egal ob Business-Event, Clubnacht oder Messe – du willst Fotos, die das Feeling einfangen und Wirkung erzeugen.',
    'Event-Highlights',
    array[
      'Ich begleite dein Event diskret, fokussiert und mit Blick fürs Wesentliche.',
      'Jeder Shot sitzt, jeder Moment zählt.',
      'Du bekommst Bilder, die du sofort einsetzen kannst – für PR, Social Media oder die interne Kommunikation.'
    ],
    array[
      'Unauffällige Begleitung mit Blick für entscheidende Momente',
      'Sofort einsatzbereite Bilder für PR, Social Media und interne Kommunikation',
      'Individuelle Bildsprache passend zu deinem Markenauftritt'
    ],
    '#141b2b',
    '#1f2d48',
    'events.webp'
  ),
  (
    'portrait',
    'Portrait',
    'Du willst ein Bild, das dich wirklich zeigt?',
    'Standard-Portraits wirken oft künstlich. Du brauchst Bilder, die deine Persönlichkeit transportieren – für Socials, Bewerbung oder Personal Branding.',
    'Portrait-Sessions',
    array[
      'Ich sorge für eine entspannte Atmosphäre und helfe dir, dich natürlich und stark zu zeigen.',
      'Keine Studiozwänge, keine Posen von der Stange – dafür echte Präsenz im Bild.'
    ],
    array[
      'Individuelle Vorbereitung auf Basis deiner Ziele',
      'On-Location oder Outdoor-Shootings für authentische Ergebnisse',
      'Professionelle Retusche mit natürlichem Look'
    ],
    '#1a1a27',
    '#312f4f',
    'portrait.webp'
  ),
  (
    'drone',
    'Drohnen',
    'Du brauchst die Vogelperspektive?',
    'Ob für Imagefilme, Immobilien, Events oder kreative Social-Media-Inhalte – Aufnahmen aus der Luft bringen dein Projekt auf das nächste Level.',
    'Drohnen-Produktionen',
    array[
      'Ich fliege mit professioneller Technik, nötiger Genehmigung und präziser Planung.',
      'Du bekommst gestochen scharfe Bilder oder Videos aus Blickwinkeln, die im Gedächtnis bleiben.'
    ],
    array[
      'Zertifizierter Drohnenpilot mit allen relevanten Genehmigungen',
      '4K-Foto- und Videoaufnahmen inklusive Farbkorrektur',
      'Sicherheits- und Standortcheck vor jedem Flug'
    ],
    '#0f1a2a',
    '#223d57',
    'drone.jpg'
  ),
  (
    'wedding',
    'Hochzeiten',
    'Dein großer Tag. Festgehalten für immer.',
    'Bei deiner Hochzeit darf nichts dem Zufall überlassen werden – vor allem nicht die Bilder.',
    'Hochzeitsreportagen',
    array[
      'Ich begleite dich dezent, professionell und mit dem Blick fürs Detail.',
      'Du bekommst emotionale, zeitlose Aufnahmen, die eure Geschichte erzählen.',
      'Damit du dich voll auf den Moment konzentrieren kannst – ich kümmere mich um den Rest.'
    ],
    array[
      'Ganztägige Begleitung oder einzelne Programmpunkte möglich',
      'Persönliche Vorbesprechung und Location-Scouting',
      'Sichere Datensicherung und liebevoll aufbereitete Highlight-Galerie'
    ],
    '#231424',
    '#4a1f3f',
    'hochzeit.webp'
  )
on conflict (slug) do update
set
  label = excluded.label,
  headline = excluded.headline,
  subline = excluded.subline,
  info_title = excluded.info_title,
  info_paragraphs = excluded.info_paragraphs,
  info_bullet_points = excluded.info_bullet_points,
  gradient_start = excluded.gradient_start,
  gradient_end = excluded.gradient_end,
  image_path = excluded.image_path,
  updated_at = timezone('utc'::text, now());
