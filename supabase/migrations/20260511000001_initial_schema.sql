-- ─── Extensions ─────────────────────────────────────────────────────────────
-- uuid-ossp is NOT needed: gen_random_uuid() is native in Postgres 14+
create extension if not exists "pg_trgm";     -- fuzzy title deduplication
create extension if not exists "unaccent";    -- accent-insensitive search

-- ─── Sources ─────────────────────────────────────────────────────────────────
create table if not exists public.sources (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  url        text not null,
  rss_url    text,
  logo_url   text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed the initial news sources
insert into public.sources (name, url, rss_url, logo_url) values
  ('CoinTelegraph',   'https://cointelegraph.com',         'https://cointelegraph.com/rss',                              null),
  ('CoinDesk',        'https://www.coindesk.com',          'https://www.coindesk.com/arc/outboundfeeds/rss/',            null),
  ('Decrypt',         'https://decrypt.co',                'https://decrypt.co/feed',                                   null),
  ('The Block',       'https://www.theblock.co',           'https://www.theblock.co/rss.xml',                           null),
  ('Bitcoin Magazine','https://bitcoinmagazine.com',       'https://bitcoinmagazine.com/.rss/full/',                     null),
  ('BeInCrypto',      'https://beincrypto.com',            'https://beincrypto.com/feed/',                              null),
  ('Blockworks',      'https://blockworks.co',             'https://blockworks.co/feed',                                null),
  ('NewsBTC',         'https://www.newsbtc.com',           'https://www.newsbtc.com/feed/',                             null)
on conflict do nothing;

-- ─── Categories enum ─────────────────────────────────────────────────────────
do $$ begin
  create type public.article_category as enum (
    'bitcoin', 'ethereum', 'altcoins', 'defi', 'regulation',
    'nfts', 'market', 'technology', 'general'
  );
exception when duplicate_object then null;
end $$;

-- ─── Articles ────────────────────────────────────────────────────────────────
create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  url          text not null unique,
  image_url    text,
  summary      text,
  published_at timestamptz not null default now(),
  category     public.article_category not null default 'general',
  coins        text[] not null default '{}',
  is_breaking  boolean not null default false,
  source_id    uuid not null references public.sources(id) on delete cascade,
  created_at   timestamptz not null default now(),
  -- fts column populated via trigger below (unaccent is not immutable so
  -- it cannot be used in a GENERATED ALWAYS column)
  fts          tsvector
);

-- Indexes
create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_category_idx      on public.articles (category);
create index if not exists articles_source_id_idx     on public.articles (source_id);
create index if not exists articles_coins_idx         on public.articles using gin (coins);
create index if not exists articles_fts_idx           on public.articles using gin (fts);
-- pg_trgm index on title for fuzzy deduplication checks
create index if not exists articles_title_trgm_idx    on public.articles using gin (title gin_trgm_ops);

-- Trigger function to keep fts up to date on insert/update
create or replace function public.articles_fts_update()
returns trigger language plpgsql as $$
begin
  new.fts := to_tsvector(
    'english',
    coalesce(new.title, '') || ' ' || coalesce(new.summary, '')
  );
  return new;
end;
$$;

create trigger articles_fts_trigger
  before insert or update of title, summary
  on public.articles
  for each row execute procedure public.articles_fts_update();

-- ─── User preferences ────────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  followed_categories   text[] not null default '{}',
  followed_coins        text[] not null default '{}',
  push_enabled          boolean not null default false,
  updated_at            timestamptz not null default now()
);

-- Auto-create preferences row on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Bookmarks ───────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks (user_id);

-- ─── Push subscriptions ──────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- sources & articles: publicly readable
alter table public.sources        enable row level security;
alter table public.articles       enable row level security;
alter table public.user_preferences enable row level security;
alter table public.bookmarks      enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "sources_public_read"  on public.sources  for select using (true);
create policy "articles_public_read" on public.articles for select using (true);

create policy "prefs_own_read"   on public.user_preferences for select using (auth.uid() = user_id);
create policy "prefs_own_write"  on public.user_preferences for update using (auth.uid() = user_id);
create policy "prefs_own_insert" on public.user_preferences for insert with check (auth.uid() = user_id);

create policy "bookmarks_own_read"   on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_own_insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_own_delete" on public.bookmarks for delete using (auth.uid() = user_id);

create policy "push_own_read"   on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "push_own_insert" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "push_own_delete" on public.push_subscriptions for delete using (auth.uid() = user_id);
