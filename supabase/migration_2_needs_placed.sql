-- Migration : ajoute le suivi "place / pas place" pour le panneau de besoins
-- flottant de Meeting 2. A executer une seule fois dans Supabase SQL Editor.

alter table planif_hebdo.projects
  add column if not exists s1_placed boolean not null default false,
  add column if not exists s2_placed boolean not null default false;
