-- Migration : ajoute les notes libres ("pastille") a une base deja en place.
-- A executer une seule fois dans : Supabase Dashboard > SQL Editor > New query.
-- (Si tu repars d'une base neuve avec schema.sql, tu n'as PAS besoin de ce fichier -
-- schema.sql cree deja cette table.)

create table if not exists planif_hebdo.project_comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references planif_hebdo.projects(id) on delete cascade,
  author text,
  body text not null,
  created_at timestamptz not null default now()
);

alter table planif_hebdo.project_comments enable row level security;

create policy "anon full access" on planif_hebdo.project_comments for all using (true) with check (true);

alter publication supabase_realtime add table planif_hebdo.project_comments;
