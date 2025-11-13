-- Script para cambiar el tipo_usuario de un usuario de 'postulante' a 'ofertante'.
--
-- Instrucciones:
-- 1. Elige una de las dos opciones de abajo (por ID o por email).
-- 2. Reemplaza el marcador de posición (ej. '[ID_DEL_USUARIO]') con el valor real.
-- 3. Ejecuta el comando SQL en tu base de datos.

-- Opción 1: Actualizar por ID de usuario
UPDATE usuarios
SET tipo_usuario = 'ofertante'
WHERE id = [ID_DEL_USUARIO];

-- Opción 2: Actualizar por email de usuario
UPDATE usuarios
SET tipo_usuario = 'ofertante'
WHERE email = '[EMAIL_DEL_USUARIO]';
