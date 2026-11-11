-- Table des abonnements. Écrite uniquement par le webhook Stripe (côté serveur).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Chaque utilisateur connecté ne lit que son propre abonnement.
create policy "Chacun lit son abonnement"
  on public.subscriptions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Aucune politique d'écriture : le navigateur ne peut jamais modifier cette table.
revoke all on public.subscriptions from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
