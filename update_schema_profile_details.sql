-- Añadir campos de redes sociales, físicos y personales a la tabla de perfiles
ALTER TABLE perfiles_usuario
ADD transfermarkt_url NVARCHAR(255) NULL,
    altura_cm INT NULL, -- Altura en centímetros
    peso_kg INT NULL, -- Peso en kilogramos
    pie_dominante NVARCHAR(50) NULL,
    fecha_de_nacimiento DATE NULL;
