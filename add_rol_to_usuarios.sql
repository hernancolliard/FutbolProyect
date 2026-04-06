-- Agregar campo rol a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN rol VARCHAR(50);

-- Actualizar usuarios existentes si es necesario
-- UPDATE usuarios SET rol = 'jugador' WHERE tipo_usuario = 'postulante';
-- UPDATE usuarios SET rol = 'club' WHERE tipo_usuario = 'ofertante';