-- Migration: agregar whatsapp_url a perfiles_usuario
ALTER TABLE perfiles_usuario
  ADD COLUMN IF NOT EXISTS whatsapp_url VARCHAR(255);
