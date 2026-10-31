-- Nightly fresh trivia at 3:17 AM Eastern (07:17 UTC; 08:17 UTC in winter is fine too).
-- Before this runs, store two values in Supabase Vault (Dashboard → Project Settings → Vault, or SQL):
--   select vault.create_secret('https://<your-project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<same value as the CRON_SECRET function secret>', 'cron_secret');
-- © 2026 Adam Kornreich / R.A. Consulting ❤ Pops & Pippy

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'poy-nightly-questions';

select cron.schedule(
  'poy-nightly-questions',
  '17 7 * * *',
  $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/generate-questions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 150000
  );
  $$
);
