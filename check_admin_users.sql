-- Verificar qué usuarios tienen isadmin = true
SELECT id, nombre, email, tipo_usuario, isadmin
FROM usuarios
WHERE isadmin = true;

-- Verificar todos los usuarios para ver cuáles existen
SELECT id, nombre, email, tipo_usuario, isadmin
FROM usuarios
ORDER BY id;