-- Add sentiment column to articles table
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS sentiment text
    NOT NULL
    DEFAULT 'neutral'
    CHECK (sentiment IN ('bullish', 'bearish', 'neutral'));

-- Index for filtering by sentiment
CREATE INDEX IF NOT EXISTS articles_sentiment_idx ON articles (sentiment);
