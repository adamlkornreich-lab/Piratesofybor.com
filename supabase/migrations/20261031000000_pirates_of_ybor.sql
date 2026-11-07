-- Pirates of Ybor: accounts, scores, store entitlements and the trivia question bank.
-- © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy
-- Every table has row level security. Players only ever see and change their own rows;
-- questions are read-only to players and written only by the generator (service role) and admins.

create extension if not exists pgcrypto;

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 40),
  avatar       text check (char_length(avatar) <= 500),
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: delete own" on public.profiles for delete using (auth.uid() = id);

-- New sign-ups get a profile automatically, named from the provider when it gives one.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Deckhand'), 40),
    left(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), 500)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── scores ─────────────────────────
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  game       text not null check (char_length(game) <= 80),
  score      numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists scores_user_game on public.scores (user_id, game, created_at desc);
alter table public.scores enable row level security;

create policy "scores: read own"   on public.scores for select using (auth.uid() = user_id);
create policy "scores: insert own" on public.scores for insert with check (auth.uid() = user_id);
create policy "scores: delete own" on public.scores for delete using (auth.uid() = user_id);

-- Best score per game for the signed-in player (golf counts lower as better).
create or replace view public.my_best_scores with (security_invoker = true) as
  select game,
         case when game like 'golf%' then min(score) else max(score) end as best,
         max(created_at) as last_played
  from public.scores
  where user_id = auth.uid()
  group by game;

-- ───────────────────────── entitlements ─────────────────────────
-- Written only by the RevenueCat webhook (service role). Players can read their own.
create table if not exists public.entitlements (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  product_id     text not null,
  source         text not null,                 -- app_store | play_store | amazon | promotional
  transaction_id text unique,
  expires_at     timestamptz,                   -- null = never expires (course pack) or unused consumable
  consumed_at    timestamptz,                   -- tournament entries are marked when used
  created_at     timestamptz not null default now()
);
create index if not exists entitlements_user on public.entitlements (user_id, product_id);
alter table public.entitlements enable row level security;

create policy "entitlements: read own" on public.entitlements for select using (auth.uid() = user_id);

create or replace function public.has_entitlement(p_product text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.entitlements
    where user_id = auth.uid() and product_id = p_product
      and consumed_at is null
      and (expires_at is null or expires_at > now())
  );
$$;

-- Use one tournament entry. Returns true if one was available.
create or replace function public.use_tournament_entry() returns boolean
language plpgsql security definer set search_path = public as $$
declare v_id bigint;
begin
  select id into v_id from public.entitlements
   where user_id = auth.uid() and product_id = 'poy_tournament_entry' and consumed_at is null
   order by created_at limit 1 for update skip locked;
  if v_id is null then return false; end if;
  update public.entitlements set consumed_at = now() where id = v_id;
  return true;
end $$;

-- ───────────────────────── admins ─────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
create policy "admins: see self" on public.admins for select using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ───────────────────────── questions ─────────────────────────
create table if not exists public.questions (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,                  -- Movies, Science, Famous People, World, Sports, History,
                                                -- Animals, Pirates, Florida Pirate Trail, Gaspar's Grotto
  difficulty    smallint not null check (difficulty between 1 and 3),
  question      text not null check (char_length(question) <= 300),
  options       jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation   text check (char_length(explanation) <= 400),
  source_hash   text not null unique,           -- sha256 of normalized question + answer, for dedupe
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  premium       boolean not null default false, -- extra trivia packs for Crew Pass members
  tone          text not null default 'clean' check (tone in ('clean','flirty')),
  review_note   text,
  times_served  integer not null default 0,
  times_correct integer not null default 0,
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);
create index if not exists questions_serve on public.questions (status, category, premium);
alter table public.questions enable row level security;

create policy "questions: players read approved" on public.questions for select using (
  status = 'approved' and (not premium or public.has_entitlement('poy_crew_pass_monthly'))
);
create policy "questions: admins read all" on public.questions for select using (public.is_admin());
create policy "questions: admins review"   on public.questions for update using (public.is_admin()) with check (public.is_admin());
-- No insert/delete policies: only the service role (the generator) adds questions.

-- Players report results without being able to edit questions.
create or replace function public.record_answer(p_question uuid, p_correct boolean) returns void
language sql security definer set search_path = public as $$
  update public.questions
     set times_served = times_served + 1,
         times_correct = times_correct + case when p_correct then 1 else 0 end
   where id = p_question and status = 'approved';
$$;

-- ───────────────────────── Quartermaster rate limit ─────────────────────────
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  calls   integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
create policy "ai_usage: read own" on public.ai_usage for select using (auth.uid() = user_id);

create or replace function public.bump_ai_usage(p_user uuid, p_limit integer) returns boolean
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  insert into public.ai_usage (user_id, day, calls) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set calls = public.ai_usage.calls + 1
  returning calls into v;
  return v <= p_limit;
end $$;
revoke execute on function public.bump_ai_usage(uuid, integer) from public, anon, authenticated;

grant select on public.my_best_scores to authenticated;
grant execute on function public.has_entitlement(text), public.use_tournament_entry(),
  public.is_admin(), public.record_answer(uuid, boolean) to authenticated;
grant execute on function public.record_answer(uuid, boolean) to anon;
