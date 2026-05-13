-- Helper function called by the ingest-news Edge Function.
-- Returns true when a title is too similar (>= 0.82) to an existing article.
create or replace function public.is_duplicate_article(p_title text)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.articles
    where similarity(title, p_title) >= 0.82
    limit 1
  );
$$;

-- Grant execute to the service role used by Edge Functions
grant execute on function public.is_duplicate_article(text) to service_role;
