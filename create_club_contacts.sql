-- Script para crear la tabla de contactos de clubes
-- Compatible con PostgreSQL (para usar en DBeaver)

DROP TABLE IF EXISTS club_contacts;

CREATE TABLE club_contacts (
  id SERIAL PRIMARY KEY,
  club TEXT NOT NULL,
  website TEXT,
  email TEXT,
  email2 TEXT,
  email3 TEXT,
  phone TEXT,
  country TEXT,
  league TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas por país, liga y búsqueda por nombre
CREATE INDEX idx_club_contacts_country ON club_contacts(country);
CREATE INDEX idx_club_contacts_league ON club_contacts(league);
CREATE INDEX idx_club_contacts_club ON club_contacts(LOWER(club));

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON club_contacts;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON club_contacts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Ejemplos de inserción
INSERT INTO club_contacts (club, website, email, phone, country, league)
VALUES
('Club Ejemplo', 'https://www.clubejemplo.com', 'contacto@clubejemplo.com', '+54 9 11 1234-5678', 'Argentina', 'Primera División');
