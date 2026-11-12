-- Clients suivis par chaque abonné, et chiffres mensuels de chaque client.

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nom text not null check (char_length(nom) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200),
  created_at timestamptz not null default now()
);
create index clients_user_id_idx on public.clients (user_id);

create table public.bilans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  mois date not null check (extract(day from mois) = 1),
  publications integer not null check (publications between 0 and 100000),
  vues integer not null check (vues between 0 and 2000000000),
  abonnes_gagnes integer not null check (abonnes_gagnes between -2000000000 and 2000000000),
  engagement numeric(5,2) not null check (engagement between 0 and 100),
  commentaire text check (char_length(commentaire) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, mois)
);
create index bilans_user_id_idx on public.bilans (user_id);

-- Au plus 10 clients par abonné (règle de l'offre), vérifié côté base.
create function public.limiter_clients() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.clients where user_id = new.user_id) >= 10 then
    raise exception 'Limite de 10 clients atteinte';
  end if;
  return new;
end;
$$;
revoke execute on function public.limiter_clients() from public, anon, authenticated;
create trigger clients_limite before insert on public.clients
  for each row execute function public.limiter_clients();

-- Un bilan doit appartenir à un client du même utilisateur.
create function public.verifier_bilan() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.clients c where c.id = new.client_id and c.user_id = new.user_id
  ) then
    raise exception 'Client inconnu';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.verifier_bilan() from public, anon, authenticated;
create trigger bilans_verif before insert or update on public.bilans
  for each row execute function public.verifier_bilan();

alter table public.clients enable row level security;
alter table public.bilans enable row level security;

-- Lecture, ajout, modification, suppression : uniquement ses propres lignes,
-- et seulement avec un abonnement actif.
create policy "Clients : lecture" on public.clients for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Clients : ajout" on public.clients for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.subscriptions s
                where s.user_id = (select auth.uid()) and s.status in ('active','trialing'))
  );
create policy "Clients : modification" on public.clients for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Clients : suppression" on public.clients for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Bilans : lecture" on public.bilans for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Bilans : ajout" on public.bilans for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.subscriptions s
                where s.user_id = (select auth.uid()) and s.status in ('active','trialing'))
  );
create policy "Bilans : modification" on public.bilans for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Bilans : suppression" on public.bilans for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.clients, public.bilans from anon, authenticated;
grant select, insert, update, delete on public.clients, public.bilans to authenticated;
grant all on public.clients, public.bilans to service_role;
