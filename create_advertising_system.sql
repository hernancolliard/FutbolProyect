CREATE TABLE IF NOT EXISTS advertisements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  advertiser_name VARCHAR(160) NOT NULL,
  advertiser_type VARCHAR(60) NOT NULL DEFAULT 'sponsor',
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  placement VARCHAR(80) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'all',
  country VARCHAR(120),
  description TEXT,
  button_text VARCHAR(80) DEFAULT 'Ver mas',
  package_type VARCHAR(80),
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  impressions_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT advertisements_target_url_check CHECK (target_url ~* '^https?://'),
  CONSTRAINT advertisements_image_url_check CHECK (image_url ~* '^https?://'),
  CONSTRAINT advertisements_date_range_check CHECK (
    end_date IS NULL OR start_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_advertisements_public_lookup
  ON advertisements (placement, is_active, language, priority DESC);

CREATE INDEX IF NOT EXISTS idx_advertisements_dates
  ON advertisements (start_date, end_date);

CREATE TABLE IF NOT EXISTS advertising_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  company VARCHAR(160),
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(80),
  website TEXT,
  advertiser_type VARCHAR(60),
  budget VARCHAR(80),
  message TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT advertising_leads_email_check CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  CONSTRAINT advertising_leads_website_check CHECK (
    website IS NULL OR website = '' OR website ~* '^https?://'
  )
);

CREATE INDEX IF NOT EXISTS idx_advertising_leads_status_created
  ON advertising_leads (status, created_at DESC);
