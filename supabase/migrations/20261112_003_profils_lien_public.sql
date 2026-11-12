-- Marque et couleur de chaque prestataire ; lien public, accusé de lecture et date d'envoi des bilans.
create table public.profils (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marque text not null check (char_length(marque) between 1 and 60),
  couleur text not null default '#14213D' check (couleur ~ '^#[0-9A-Fa-f]{6}$'),
  updated_at timestamptz not null default now()
);
alter table public.profils enable row level security;
create policy "Profil : lecture" on public.profils for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Profil : ajout" on public.profils for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Profil : modification" on public.profils for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.profils from anon, authenticated;
grant select, insert, update on public.profils to authenticated;
grant all on public.profils to service_role;

alter table public.bilans
  add column token uuid not null default gen_random_uuid(),
  add column lu_at timestamptz,
  add column envoye_at timestamptz;
create unique index bilans_token_idx on public.bilans (token);
