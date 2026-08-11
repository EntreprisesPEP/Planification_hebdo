-- Planification Hebdomadaire - PEP2000
-- Schema Supabase. A executer une fois dans : Supabase Dashboard > SQL Editor > New query.
--
-- Cette app vit dans son propre schema Postgres ("planif_hebdo") plutot que dans
-- "public", pour pouvoir partager le MEME projet Supabase que tes autres apps
-- Toolbox PEP (Carnet de taches, Ordre du jour, etc.) sans jamais entrer en
-- conflit avec leurs tables.

create schema if not exists planif_hebdo;
create extension if not exists "uuid-ossp";

-- ============ PROJETS ============
create table if not exists planif_hebdo.projects (
  id uuid primary key default uuid_generate_v4(),
  no text not null,
  projet text not null,
  charge text default '',
  surintendant text default '',
  statut text not null default 'A venir',
  s1 boolean not null default false,
  s2 boolean not null default false,
  s1_placed boolean not null default false,
  s2_placed boolean not null default false,
  commentaire text default '',
  date_valeur date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Historique hebdomadaire des notes (statut / commentaire / date) par projet
create table if not exists planif_hebdo.weekly_notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references planif_hebdo.projects(id) on delete cascade,
  week_start date not null,
  statut text,
  commentaire text,
  date_valeur date,
  updated_at timestamptz not null default now(),
  unique (project_id, week_start)
);

-- ============ CONTREMAITRES ============
create table if not exists planif_hebdo.contremaitres (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  sort_order integer not null default 0
);

-- Attribution contremaitre <-> projet pour un jour donne
create table if not exists planif_hebdo.assignments (
  id uuid primary key default uuid_generate_v4(),
  contremaitre_id uuid not null references planif_hebdo.contremaitres(id) on delete cascade,
  day date not null,
  project_id uuid references planif_hebdo.projects(id) on delete set null,
  unique (contremaitre_id, day)
);

-- ============ LISTES DE NOMS (admin) ============
create table if not exists planif_hebdo.charges (
  id uuid primary key default uuid_generate_v4(),
  nom text not null unique
);

create table if not exists planif_hebdo.surintendants (
  id uuid primary key default uuid_generate_v4(),
  nom text not null unique
);

-- ============ PARAMETRES PARTAGES (semaine affichee, etc.) ============
create table if not exists planif_hebdo.app_settings (
  id integer primary key default 1,
  range_start date,
  notes_week_start date,
  constraint single_row check (id = 1)
);
insert into planif_hebdo.app_settings (id, range_start, notes_week_start)
  values (1, date_trunc('week', now())::date, date_trunc('week', now())::date)
  on conflict (id) do nothing;

-- Notes libres ("pastille") - commentaires ad hoc pendant la semaine, distincts
-- du commentaire officiel de Meeting 1. Tout le monde peut en ajouter, meme en
-- mode participant.
create table if not exists planif_hebdo.project_comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references planif_hebdo.projects(id) on delete cascade,
  author text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ============ ACCES POUR L'API (obligatoire hors du schema public) ============
-- Les schemas autres que "public" ne sont pas exposes a l'API REST/JS par defaut.
-- Ces lignes rendent "planif_hebdo" accessible via l'API, comme "public" l'est.
grant usage on schema planif_hebdo to anon, authenticated, service_role;
grant all on all tables in schema planif_hebdo to anon, authenticated, service_role;
alter default privileges in schema planif_hebdo grant all on tables to anon, authenticated, service_role;

-- Ensuite, dans Supabase Dashboard > Project Settings > API > "Exposed schemas",
-- ajoute "planif_hebdo" a la liste (en plus de "public"). Sans cette etape,
-- l'app ne pourra pas lire/ecrire malgre les policies ci-dessous.

-- ============ ROW LEVEL SECURITY ============
-- Ce projet n'a PAS d'authentification (comme le prototype d'origine) : usage interne d'equipe
-- avec un lien partage, pas un site public. Les regles ci-dessous autorisent la cle "anon"
-- a tout lire/ecrire. Si vous ajoutez de l'authentification plus tard, remplacez ces policies
-- par des regles basees sur auth.uid().

alter table planif_hebdo.projects enable row level security;
alter table planif_hebdo.weekly_notes enable row level security;
alter table planif_hebdo.contremaitres enable row level security;
alter table planif_hebdo.assignments enable row level security;
alter table planif_hebdo.charges enable row level security;
alter table planif_hebdo.surintendants enable row level security;
alter table planif_hebdo.app_settings enable row level security;
alter table planif_hebdo.project_comments enable row level security;

create policy "anon full access" on planif_hebdo.projects for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.weekly_notes for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.contremaitres for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.assignments for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.charges for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.surintendants for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.app_settings for all using (true) with check (true);
create policy "anon full access" on planif_hebdo.project_comments for all using (true) with check (true);

-- ============ REALTIME ============
-- Active la diffusion en temps reel (remplace le "polling" du prototype).
alter publication supabase_realtime add table planif_hebdo.projects;
alter publication supabase_realtime add table planif_hebdo.weekly_notes;
alter publication supabase_realtime add table planif_hebdo.contremaitres;
alter publication supabase_realtime add table planif_hebdo.assignments;
alter publication supabase_realtime add table planif_hebdo.charges;
alter publication supabase_realtime add table planif_hebdo.surintendants;
alter publication supabase_realtime add table planif_hebdo.app_settings;
alter publication supabase_realtime add table planif_hebdo.project_comments;
