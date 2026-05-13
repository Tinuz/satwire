-- Fix HTML entities in existing article titles and summaries
UPDATE public.articles
SET
  title = regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '&#8217;', chr(8217), 'g'),
        '&#8216;', chr(8216), 'g'),
      '&#8220;', chr(8220), 'g'),
    '&#8221;', chr(8221), 'g')
WHERE title ~ '&#[0-9]+;';
