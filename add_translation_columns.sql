
-- Añadir columnas de traducción para la tabla de ofertas laborales
ALTER TABLE ofertas_laborales
ADD titulo_es NVARCHAR(150) NULL,
    titulo_en NVARCHAR(150) NULL,
    descripcion_es NTEXT NULL,
    descripcion_en NTEXT NULL,
    puesto_es NVARCHAR(100) NULL,
    puesto_en NVARCHAR(100) NULL,
    ubicacion_es NVARCHAR(100) NULL,
    ubicacion_en NVARCHAR(100) NULL,
    horarios_es NVARCHAR(100) NULL,
    horarios_en NVARCHAR(100) NULL,
    nivel_es NVARCHAR(50) NULL,
    nivel_en NVARCHAR(50) NULL,
    detalles_adicionales_es NTEXT NULL,
    detalles_adicionales_en NTEXT NULL;

-- Añadir columnas de traducción para la tabla de perfiles de usuario
ALTER TABLE perfiles_usuario
ADD resumen_profesional_es NTEXT NULL,
    resumen_profesional_en NTEXT NULL,
    posicion_principal_es NVARCHAR(100) NULL,
    posicion_principal_en NVARCHAR(100) NULL,
    nacionalidad_es NVARCHAR(100) NULL,
    nacionalidad_en NVARCHAR(100) NULL,
    pie_dominante_es NVARCHAR(50) NULL,
    pie_dominante_en NVARCHAR(50) NULL;

-- Añadir columnas de título y traducción para la tabla de fotos de usuario
ALTER TABLE user_photos
ADD title NVARCHAR(255) NULL,
    title_es NVARCHAR(255) NULL,
    title_en NVARCHAR(255) NULL;
