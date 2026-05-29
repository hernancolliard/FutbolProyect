CREATE TABLE IF NOT EXISTS scouting_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scouting_report_images (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES scouting_reports(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, position)
);

CREATE INDEX IF NOT EXISTS idx_scouting_reports_user_id
  ON scouting_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_scouting_report_images_report_id
  ON scouting_report_images(report_id);
