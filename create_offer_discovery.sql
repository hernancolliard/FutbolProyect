-- Additive migration; apply explicitly to local/staging first.
BEGIN;
CREATE TABLE IF NOT EXISTS offer_discovery_settings (
 id INTEGER PRIMARY KEY CHECK (id = 1), config JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS offer_discovery_runs (
 id BIGSERIAL PRIMARY KEY, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), finished_at TIMESTAMPTZ,
 status TEXT NOT NULL CHECK (status IN ('running','completed','partial','failed')),
 initiated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
 stats JSONB NOT NULL DEFAULT '{}', errors JSONB NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS discovered_offers (
 id BIGSERIAL PRIMARY KEY, version INTEGER NOT NULL DEFAULT 1, normalized_url TEXT NOT NULL UNIQUE, identity_key TEXT NOT NULL UNIQUE,
 source_urls JSONB NOT NULL DEFAULT '[]', source_url TEXT NOT NULL, consulted_at TIMESTAMPTZ NOT NULL,
 extracted JSONB NOT NULL, content_hash TEXT NOT NULL, draft JSONB NOT NULL,
 flags JSONB NOT NULL DEFAULT '[]', possible_duplicate_ids JSONB NOT NULL DEFAULT '[]',
 status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','publicada','descartada')),
 published_offer_id INTEGER REFERENCES ofertas_laborales(id) ON DELETE SET NULL,
 reviewed_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, reviewed_at TIMESTAMPTZ,
 run_id BIGINT REFERENCES offer_discovery_runs(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS discovered_offers_status_date ON discovered_offers(status, updated_at DESC);
COMMIT;
