-- Catálogo de clubes y escudos para FutbolProyect.
-- Compatible con PostgreSQL y seguro para ejecutar más de una vez.

CREATE TABLE IF NOT EXISTS football_clubs (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  source_slug VARCHAR(180) NOT NULL,
  name VARCHAR(200) NOT NULL,
  country VARCHAR(120) NOT NULL,
  country_slug VARCHAR(120) NOT NULL,
  league VARCHAR(200),
  logo_url TEXT,
  logo_source_url TEXT NOT NULL,
  source_page_url TEXT NOT NULL,
  attribution TEXT,
  usage_context VARCHAR(80) NOT NULL DEFAULT 'identification/editorial/reference',
  source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT football_clubs_source_slug_unique UNIQUE (source, source_slug)
);

CREATE INDEX IF NOT EXISTS idx_football_clubs_name
  ON football_clubs (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_football_clubs_country
  ON football_clubs (LOWER(country));
CREATE INDEX IF NOT EXISTS idx_football_clubs_league
  ON football_clubs (LOWER(league));

CREATE OR REPLACE FUNCTION set_football_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS football_clubs_set_updated_at ON football_clubs;
CREATE TRIGGER football_clubs_set_updated_at
BEFORE UPDATE ON football_clubs
FOR EACH ROW
EXECUTE FUNCTION set_football_clubs_updated_at();
