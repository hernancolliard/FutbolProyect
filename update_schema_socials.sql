-- Añadir columna para el apellido en la tabla de usuarios
ALTER TABLE usuarios
ADD apellido NVARCHAR(100) NULL;

-- Añadir columnas para redes sociales en la tabla de perfiles
ALTER TABLE perfiles_usuario
ADD linkedin_url NVARCHAR(255) NULL,
    instagram_url NVARCHAR(255) NULL,
    youtube_url NVARCHAR(255) NULL;
