-- ==========================================================
-- SCHEMA SUPABASE — Portfolio Nako Priva
-- À coller dans Supabase > SQL Editor > New query > Run
-- ==========================================================

-- Table profil (une seule ligne : tes infos + photo hero)
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'NAKO NAKO PRIVA RUISSEL',
  tagline text default 'Designer Graphique · UI/UX Designer · Développeur · IA',
  bio text default 'Décris-toi ici depuis la page /admin.html',
  hero_image_url text,
  phone1 text default '653074958',
  phone2 text default '676050015',
  whatsapp text default '653074958',
  email text default 'nakopriva164@gmail.com',
  updated_at timestamptz default now()
);

insert into profile (full_name)
select 'NAKO NAKO PRIVA RUISSEL'
where not exists (select 1 from profile);

-- Table projets
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('design', 'uiux', 'dev', 'ia')),
  description text,
  image_url text,
  project_link text,
  position int default 0,
  created_at timestamptz default now()
);

-- Sécurité (RLS)
alter table profile enable row level security;
alter table projects enable row level security;

drop policy if exists "public read profile" on profile;
create policy "public read profile" on profile for select using (true);

drop policy if exists "auth update profile" on profile;
create policy "auth update profile" on profile for update using (auth.role() = 'authenticated');

drop policy if exists "public read projects" on projects;
create policy "public read projects" on projects for select using (true);

drop policy if exists "auth insert projects" on projects;
create policy "auth insert projects" on projects for insert with check (auth.role() = 'authenticated');

drop policy if exists "auth update projects" on projects;
create policy "auth update projects" on projects for update using (auth.role() = 'authenticated');

drop policy if exists "auth delete projects" on projects;
create policy "auth delete projects" on projects for delete using (auth.role() = 'authenticated');

-- ==========================================================
-- STORAGE (à faire dans l'interface, pas en SQL) :
-- 1. Storage > New bucket > nom : "portfolio" > Public bucket : OUI
-- 2. Storage > portfolio > Policies > New policy :
--    - SELECT (lecture) : public, using (true)
--    - INSERT/UPDATE/DELETE : authenticated only
-- ==========================================================
