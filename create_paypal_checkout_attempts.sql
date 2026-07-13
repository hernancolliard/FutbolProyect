CREATE TABLE IF NOT EXISTS paypal_checkout_attempts (
  id BIGSERIAL PRIMARY KEY,
  paypal_order_id VARCHAR(80) NOT NULL UNIQUE,
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES suscripciones(id) ON DELETE SET NULL,
  plan VARCHAR(40) NOT NULL,
  billing_cycle VARCHAR(20),
  status VARCHAR(40) NOT NULL DEFAULT 'CREATED',
  paypal_capture_id VARCHAR(80),
  error_code VARCHAR(100),
  error_message VARCHAR(500),
  last_event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  capture_started_at TIMESTAMPTZ,
  paypal_completed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT paypal_checkout_attempts_status_check CHECK (
    status IN (
      'CREATED',
      'APPROVED',
      'CANCELLED',
      'SDK_ERROR',
      'CAPTURE_STARTED',
      'PAYPAL_COMPLETED',
      'COMPLETED',
      'CAPTURE_FAILED',
      'CLIENT_CAPTURE_ERROR',
      'PROCESSING_ERROR'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_paypal_checkout_attempts_user_created
  ON paypal_checkout_attempts (id_usuario, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_paypal_checkout_attempts_status_updated
  ON paypal_checkout_attempts (status, updated_at DESC);
