-- Add 12 additional news sources (bringing total from 8 to 20)
INSERT INTO sources (name, url, rss_url, logo_url, active) VALUES
  ('The Defiant',      'https://thedefiant.io',               'https://thedefiant.io/feed',                          NULL, true),
  ('CryptoSlate',      'https://cryptoslate.com',             'https://cryptoslate.com/feed/',                       NULL, true),
  ('AMBCrypto',        'https://ambcrypto.com',               'https://ambcrypto.com/feed/',                         NULL, true),
  ('U.Today',          'https://u.today',                     'https://u.today/rss',                                 NULL, true),
  ('CoinGape',         'https://coingape.com',                'https://coingape.com/feed/',                          NULL, true),
  ('Crypto Briefing',  'https://cryptobriefing.com',          'https://cryptobriefing.com/feed/',                    NULL, true),
  ('Bitcoin.com News', 'https://news.bitcoin.com',            'https://news.bitcoin.com/feed/',                      NULL, true),
  ('DL News',          'https://www.dlnews.com',              'https://www.dlnews.com/rss.xml',                      NULL, true),
  ('Unchained',        'https://unchainedcrypto.com',         'https://unchainedcrypto.com/feed/',                   NULL, true),
  ('Protos',           'https://protos.com',                  'https://protos.com/feed/',                            NULL, true),
  ('CoinJournal',      'https://coinjournal.net',             'https://coinjournal.net/feed/',                       NULL, true),
  ('Crypto News',      'https://crypto.news',                 'https://crypto.news/feed/',                           NULL, true)
ON CONFLICT (name) DO NOTHING;
