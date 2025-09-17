-- Tabla para los usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para las ofertas de trabajo
CREATE TABLE ofertas_laborales (
    id SERIAL PRIMARY KEY,
    id_usuario_ofertante INT REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(100),
    fecha_publicacion TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'abierta'
);

-- Tabla para las suscripciones de los usuarios
CREATE TABLE suscripciones (
    id SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    id_stripe_cliente VARCHAR(255) NOT NULL,
    id_stripe_suscripcion VARCHAR(255) NOT NULL,
    "plan" VARCHAR(50) NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    estado VARCHAR(20) NOT NULL
);

-- Tabla para las postulaciones
CREATE TABLE postulaciones (
    id SERIAL PRIMARY KEY,
    id_oferta INT REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    id_usuario_postulante INT REFERENCES usuarios(id), -- No eliminar en cascada para mantener el historial
    mensaje_presentacion TEXT,
    fecha_postulacion TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'enviada',
    CONSTRAINT UQ_postulacion UNIQUE (id_oferta, id_usuario_postulante)
);

ALTER TABLE ofertas_laborales
ADD COLUMN imagen_url VARCHAR(255) NULL;

-- Eliminar las columnas de Stripe si ya no se usarán
ALTER TABLE suscripciones
DROP COLUMN id_stripe_cliente, 
DROP COLUMN id_stripe_suscripcion;

-- Añadir columnas para Mercado Pago
ALTER TABLE suscripciones
ADD COLUMN id_mp_pago VARCHAR(255) NULL,
ADD COLUMN id_mp_suscripcion VARCHAR(255) NULL; -- Para suscripciones recurrentes de MP, si aplica

-- Añadir columnas para PayPal
ALTER TABLE suscripciones
ADD COLUMN id_paypal_pago VARCHAR(255) NULL,
ADD COLUMN id_paypal_suscripcion VARCHAR(255) NULL; -- Para suscripciones recurrentes de PayPal, si aplica

-- Añadir columna para el método de pago
ALTER TABLE suscripciones
ADD COLUMN metodo_pago VARCHAR(50) NULL;

-- Modificar la columna 'plan' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN "plan" DROP NOT NULL;

-- Modificar la columna 'fecha_fin' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN fecha_fin DROP NOT NULL;

-- Modificar la columna 'estado' para que sea NULLable si es necesario, o mantenerla NOT NULL
ALTER TABLE suscripciones ALTER COLUMN estado DROP NOT NULL;
