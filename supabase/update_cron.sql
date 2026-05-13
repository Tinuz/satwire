SELECT cron.schedule(
  'ingest-news-every-15min',
  '*/15 * * * *',
  $cmd$SELECT net.http_post(url:='https://asoydguybeufhyfrbvxz.supabase.co/functions/v1/ingest-news',headers:='{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzb3lkZ3V5YmV1Zmh5ZnJidnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTE1MTgsImV4cCI6MjA5NDA4NzUxOH0.vl2DBNhni5mWVNzF5OamuzIVP26BLWvC3DjXY_WiXYI"}'::jsonb,body:='{}'::jsonb)$cmd$
);
