BEGIN;

CREATE TABLE IF NOT EXISTS affiliates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(160) NOT NULL,
  code VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  payout_email VARCHAR(160),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_months INTEGER CHECK (commission_months IS NULL OR commission_months >= 0),
  cookie_days INTEGER NOT NULL DEFAULT 60 CHECK (cookie_days > 0),
  minimum_payout NUMERIC(12,2) NOT NULL DEFAULT 20.00 CHECK (minimum_payout >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'BLOCKED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_admin_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  visitor_id VARCHAR(120),
  session_id VARCHAR(120),
  landing_path TEXT,
  referrer_url TEXT,
  utm_source VARCHAR(120),
  utm_medium VARCHAR(120),
  utm_campaign VARCHAR(160),
  ip_hash VARCHAR(128),
  user_agent_hash VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  referred_user_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE RESTRICT,
  affiliate_click_id INTEGER REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  attribution_method VARCHAR(20) NOT NULL CHECK (attribution_method IN ('LINK', 'CODE', 'ADMIN')),
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  affiliate_referral_id INTEGER NOT NULL REFERENCES affiliate_referrals(id) ON DELETE RESTRICT,
  referred_user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  internal_subscription_id INTEGER REFERENCES suscripciones(id) ON DELETE SET NULL,
  paypal_subscription_id VARCHAR(255),
  paypal_transaction_id VARCHAR(255),
  paypal_webhook_event_id INTEGER,
  gross_amount NUMERIC(12,2) NOT NULL CHECK (gross_amount >= 0),
  currency VARCHAR(3) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  commission_amount NUMERIC(12,2) NOT NULL CHECK (commission_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REVERSED', 'CANCELLED')),
  payment_number INTEGER,
  eligible_until TIMESTAMPTZ,
  available_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS affiliate_commissions_paypal_transaction_unique
  ON affiliate_commissions(paypal_transaction_id)
  WHERE paypal_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id SERIAL PRIMARY KEY,
  affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(40) NOT NULL CHECK (payment_method IN ('PAYPAL_MANUAL', 'BANK_TRANSFER', 'MERCADO_PAGO', 'OTHER')),
  external_reference VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_by_admin_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_payout_commissions (
  payout_id INTEGER NOT NULL REFERENCES affiliate_payouts(id) ON DELETE RESTRICT,
  commission_id INTEGER NOT NULL UNIQUE REFERENCES affiliate_commissions(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (payout_id, commission_id)
);

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id SERIAL PRIMARY KEY,
  paypal_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(120) NOT NULL,
  resource_id VARCHAR(255),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'FAILED')),
  processing_status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED')),
  payload JSONB NOT NULL,
  raw_body_sha256 VARCHAR(64),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_audit_logs (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id INTEGER,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE suscripciones
  ADD COLUMN IF NOT EXISTS affiliate_referral_id INTEGER REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS first_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE paypal_webhook_events
  ADD COLUMN IF NOT EXISTS raw_body_sha256 VARCHAR(64);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'affiliate_commissions_paypal_webhook_event_fk'
  ) THEN
    ALTER TABLE affiliate_commissions
      ADD CONSTRAINT affiliate_commissions_paypal_webhook_event_fk
      FOREIGN KEY (paypal_webhook_event_id) REFERENCES paypal_webhook_events(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS affiliates_code_idx ON affiliates(code);
CREATE INDEX IF NOT EXISTS affiliates_slug_idx ON affiliates(slug);
CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates(status);
CREATE INDEX IF NOT EXISTS affiliate_clicks_affiliate_id_idx ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_clicks_created_at_idx ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS affiliate_referrals_affiliate_id_idx ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_referrals_referred_user_id_idx ON affiliate_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_affiliate_id_idx ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS affiliate_commissions_status_idx ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS affiliate_commissions_available_at_idx ON affiliate_commissions(available_at);
CREATE INDEX IF NOT EXISTS affiliate_commissions_paypal_transaction_id_idx ON affiliate_commissions(paypal_transaction_id);
CREATE INDEX IF NOT EXISTS affiliate_payouts_affiliate_id_idx ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS paypal_webhook_events_paypal_event_id_idx ON paypal_webhook_events(paypal_event_id);
CREATE INDEX IF NOT EXISTS suscripciones_paypal_subscription_id_idx ON suscripciones(id_paypal_suscripcion);
CREATE INDEX IF NOT EXISTS suscripciones_affiliate_referral_id_idx ON suscripciones(affiliate_referral_id);

COMMIT;
