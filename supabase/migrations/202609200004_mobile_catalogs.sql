-- Catalogues éditoriaux en LECTURE SEULE pour le mobile.
--
-- Flux : site d'administration → MySQL → synchronisation → Supabase → application mobile.
-- Le mobile ne fait que lire. Toute écriture passe par `service_role` (le site) : aucune politique
-- d'insertion, de modification ni de suppression n'est accordée à `authenticated`, et `anon` n'a
-- aucun droit — les services sont réservés aux comptes connectés, comme sur le site.
--
-- Les colonnes reprennent celles de MySQL (`regulatory_news`, `resources`, `directory_contacts`)
-- pour que la synchronisation reste une copie, pas une traduction. Deux ajouts nullables sur
-- `directory_contacts` (`description`, `website`) : l'application les affiche déjà, MySQL ne les
-- porte pas encore. Tant que le site ne les alimente pas, ils restent vides.
--
-- ⚠️ Le site n'alimente PAS ces tables aujourd'hui (les contenus publiés sont hors de son périmètre
-- de synchronisation) : elles restent vides tant qu'une décision et un développement côté site ne
-- les remplissent. L'application traite cet état comme un état vide normal.

create table public.regulatory_news (
  id uuid primary key,
  title text not null check (length(trim(title)) between 1 and 190),
  description text not null,
  tag text not null check (tag in ('Guyane', 'Outre-mer', 'National', 'Handicap')),
  published_date date not null,
  source_name text check (length(source_name) <= 190),
  source_url text check (length(source_url) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key,
  title text not null check (length(trim(title)) between 1 and 190),
  category text not null check (length(trim(category)) between 1 and 60),
  description text not null,
  -- Markdown, restitué par l'application sans HTML (voir `simple-markdown.ts`).
  content text,
  url text check (length(url) <= 255),
  duration_label text not null check (length(duration_label) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.directory_contacts (
  id uuid primary key,
  name text not null check (length(trim(name)) between 1 and 190),
  category text not null check (length(trim(category)) between 1 and 60),
  address text check (length(address) <= 255),
  phone text check (length(phone) <= 60),
  hours text check (length(hours) <= 255),
  description text,
  website text check (length(website) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Manuel utilisateur : contenu propre à l'application mobile, rédigé dans Supabase. `is_published`
-- permet de préparer un chapitre sans l'exposer.
create table public.mobile_manual_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 120),
  summary text check (length(summary) <= 300),
  icon text check (length(icon) <= 60),
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mobile_manual_articles (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.mobile_manual_sections (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 160),
  summary text check (length(summary) <= 300),
  body text not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index regulatory_news_published_idx on public.regulatory_news (published_date desc, id);
create index resources_category_title_idx on public.resources (category, title);
create index directory_contacts_name_idx on public.directory_contacts (name);
create index mobile_manual_sections_position_idx on public.mobile_manual_sections (position, title);
create index mobile_manual_articles_section_idx on public.mobile_manual_articles (section_id, position, title);

create trigger regulatory_news_set_updated_at before update on public.regulatory_news
for each row execute function public.set_updated_at();
create trigger resources_set_updated_at before update on public.resources
for each row execute function public.set_updated_at();
create trigger directory_contacts_set_updated_at before update on public.directory_contacts
for each row execute function public.set_updated_at();
create trigger mobile_manual_sections_set_updated_at before update on public.mobile_manual_sections
for each row execute function public.set_updated_at();
create trigger mobile_manual_articles_set_updated_at before update on public.mobile_manual_articles
for each row execute function public.set_updated_at();

alter table public.regulatory_news enable row level security;
alter table public.resources enable row level security;
alter table public.directory_contacts enable row level security;
alter table public.mobile_manual_sections enable row level security;
alter table public.mobile_manual_articles enable row level security;

revoke all on public.regulatory_news from anon, authenticated;
revoke all on public.resources from anon, authenticated;
revoke all on public.directory_contacts from anon, authenticated;
revoke all on public.mobile_manual_sections from anon, authenticated;
revoke all on public.mobile_manual_articles from anon, authenticated;

grant select on public.regulatory_news to authenticated;
grant select on public.resources to authenticated;
grant select on public.directory_contacts to authenticated;
grant select on public.mobile_manual_sections to authenticated;
grant select on public.mobile_manual_articles to authenticated;

grant select, insert, update, delete on public.regulatory_news to service_role;
grant select, insert, update, delete on public.resources to service_role;
grant select, insert, update, delete on public.directory_contacts to service_role;
grant select, insert, update, delete on public.mobile_manual_sections to service_role;
grant select, insert, update, delete on public.mobile_manual_articles to service_role;

create policy regulatory_news_read on public.regulatory_news
for select to authenticated using (true);
create policy resources_read on public.resources
for select to authenticated using (true);
create policy directory_contacts_read on public.directory_contacts
for select to authenticated using (true);
create policy mobile_manual_sections_read on public.mobile_manual_sections
for select to authenticated using (is_published);
create policy mobile_manual_articles_read on public.mobile_manual_articles
for select to authenticated using (is_published);
