create database futbol_jobs_db
-- Tabla para los usuarios
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    tipo_usuario NVARCHAR(20) NOT NULL,
    fecha_creacion DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
);

-- Tabla para las ofertas de trabajo
CREATE TABLE ofertas_laborales (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario_ofertante INT FOREIGN KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo NVARCHAR(150) NOT NULL,
    descripcion NTEXT NOT NULL,
    ubicacion NVARCHAR(100),
    fecha_publicacion DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    estado NVARCHAR(20) DEFAULT 'abierta'
);

-- Tabla para las suscripciones de los usuarios
CREATE TABLE suscripciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT UNIQUE FOREIGN KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    id_stripe_cliente NVARCHAR(255) NOT NULL,
    id_stripe_suscripcion NVARCHAR(255) NOT NULL,
	[plan] NVARCHAR(50) NOT NULL,
    fecha_fin DATETIMEOFFSET NOT NULL,
    estado NVARCHAR(20) NOT NULL
);

-- Tabla para las postulaciones
CREATE TABLE postulaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_oferta INT FOREIGN KEY REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    id_usuario_postulante INT FOREIGN KEY REFERENCES usuarios(id), -- No eliminar en cascada para mantener el historial
    mensaje_presentacion NTEXT,
    fecha_postulacion DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    estado NVARCHAR(20) DEFAULT 'enviada',
    CONSTRAINT UQ_postulacion UNIQUE (id_oferta, id_usuario_postulante)
);
ALTER TABLE ofertas_laborales
ADD imagen_url NVARCHAR(255) NULL;

-- Eliminar las columnas de Stripe si ya no se usarán
ALTER TABLE suscripciones
DROP COLUMN id_stripe_cliente, id_stripe_suscripcion;

-- Añadir columnas para Mercado Pago
ALTER TABLE suscripciones
ADD id_mp_pago NVARCHAR(255) NULL,
    id_mp_suscripcion NVARCHAR(255) NULL; -- Para suscripciones recurrentes de MP, si aplica

-- Añadir columnas para PayPal
ALTER TABLE suscripciones
ADD id_paypal_pago NVARCHAR(255) NULL,
    id_paypal_suscripcion NVARCHAR(255) NULL; -- Para suscripciones recurrentes de PayPal, si aplica

-- Añadir columna para el método de pago
ALTER TABLE suscripciones
ADD metodo_pago NVARCHAR(50) NULL;

-- Modificar la columna 'plan' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN [plan] NVARCHAR(50) NULL;

-- Modificar la columna 'fecha_fin' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN fecha_fin DATETIMEOFFSET NULL;

-- Modificar la columna 'estado' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN estado NVARCHAR(20) NULL;
select * from suscripciones
