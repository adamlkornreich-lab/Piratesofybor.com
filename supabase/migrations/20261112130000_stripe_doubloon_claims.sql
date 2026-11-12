-- Each paid Stripe Checkout session can be turned into doubloons exactly once.
-- © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
-- Written only by the claim-doubloons edge function (service role). No player access.
create table if not exists public.stripe_claims (
  session_id   text primary key check (char_length(session_id) <= 255),
  doubloons    integer not null check (doubloons > 0),
  amount_total integer not null,
  currency     text not null,
  claimed_at   timestamptz not null default now()
);
alter table public.stripe_claims enable row level security;

-- The sign-up trigger is not meant to be called through the API, and tournament entries need a signed-in player.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.use_tournament_entry() from public, anon;
grant execute on function public.use_tournament_entry() to authenticated;
