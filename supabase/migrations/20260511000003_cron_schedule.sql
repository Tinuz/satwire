-- Enable pg_cron and pg_net extensions.
-- pg_net MUST be installed without `with schema` so it creates the `net` schema.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net;

-- Schedule the ingest-news Edge Function every 15 minutes.
-- Uses pg_net (net.http_post) which is the standard on Supabase.
-- The service_role_key is stored as a db setting via Supabase Dashboard:
--   Database → Settings → Configuration → add "app.service_role_key" = <your key>

select cron.schedule(
  'ingest-news-every-15min',
  '*/15 * * * *',
  $$
  select
    net.http_post(
      url     := 'https://asoydguybeufhyfrbvxz.supabase.co/functions/v1/ingest-news',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
        'Content-Type',  'application/json'
      ),
      body    := '{}'::jsonb
    );
  $$
);
