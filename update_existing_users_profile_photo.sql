-- Insertar perfiles para usuarios que no lo tienen
INSERT INTO perfiles_usuario (id_usuario, foto_perfil_url)
SELECT u.id, '/images/logos/logofpazul.webp'
FROM usuarios u
LEFT JOIN perfiles_usuario pu ON u.id = pu.id_usuario
WHERE pu.id_usuario IS NULL;

-- Actualizar perfiles de usuario existentes sin foto de perfil
UPDATE perfiles_usuario
SET foto_perfil_url = '/images/logos/logofpazul.webp'
WHERE foto_perfil_url IS NULL OR foto_perfil_url = '';
ALTER TABLE usuarios ADD COLUMN profile_views INTEGER DEFAULT 0;