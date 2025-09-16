-- Insertar usuarios de ejemplo si no existen (necesarios para las ofertas)
INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario)
SELECT 'Ofertante Ejemplo 1', 'ofertante1@example.com', 'hashed_password_1', 'ofertante'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'ofertante1@example.com');

INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario)
SELECT 'Ofertante Ejemplo 2', 'ofertante2@example.com', 'hashed_password_2', 'ofertante'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'ofertante2@example.com');

-- Obtener los IDs de los usuarios de ejemplo
DECLARE @ofertante1Id INT;
DECLARE @ofertante2Id INT;

SELECT @ofertante1Id = id FROM usuarios WHERE email = 'ofertante1@example.com';
SELECT @ofertante2Id = id FROM usuarios WHERE email = 'ofertante2@example.com';

-- Insertar ofertas de trabajo de ejemplo
INSERT INTO ofertas_laborales (id_usuario_ofertante, titulo, descripcion, ubicacion, puesto, estado, is_featured, featured_until, imagen_url)
VALUES
(@ofertante1Id, 'Delantero Centro', 'Buscamos un delantero centro con experiencia en ligas europeas.', 'Madrid, España', 'Delantero', 'abierta', 0, NULL, 'imagen_1-1756232725430-639464250.png'),
(@ofertante1Id, 'Mediocampista Ofensivo', 'Se busca mediocampista creativo con buena visión de juego.', 'Barcelona, España', 'Mediocampista', 'abierta', 0, NULL, 'imagen_2-1756232725431-599396078.png'),
(@ofertante2Id, 'Defensa Central', 'Club de primera división busca defensa central sólido.', 'Londres, Reino Unido', 'Defensa', 'abierta', 1, DATEADD(day, 30, SYSDATETIMEOFFSET()), 'imagen_3-1756232725445-927093487.jpeg'),
(@ofertante2Id, 'Portero', 'Necesitamos un portero con reflejos rápidos y buen juego aéreo.', 'París, Francia', 'Portero', 'abierta', 1, DATEADD(day, 15, SYSDATETIMEOFFSET()), 'imagen_4-1756232725445-553470013.png');