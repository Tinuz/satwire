select cron.schedule(
  'ingest-news-every-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url     := 'https://asoydguybeufhyfrbvxz.supabase.co/functions/v1/ingest-news',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  );
  $$
);
