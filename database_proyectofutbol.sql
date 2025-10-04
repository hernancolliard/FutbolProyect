-- Tabla de usuarios
CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	tipo_usuario VARCHAR(20) NOT NULL,
	fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
	"isAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
	apellido VARCHAR(100),
	telefono VARCHAR(20),
	dni VARCHAR(20),
	direccion VARCHAR(255),
	ciudad VARCHAR(100),
	pais VARCHAR(100),
	reset_password_token VARCHAR(255),
	reset_password_expires TIMESTAMPTZ
);
ALTER TABLE usuarios RENAME COLUMN "isAdmin" TO isadmin;
select * from usuarios u; 
-- Tabla de ofertas_laborales
CREATE TABLE ofertas_laborales (
	id SERIAL PRIMARY KEY,
	id_usuario_ofertante INTEGER REFERENCES usuarios (id) ON DELETE CASCADE,
	titulo VARCHAR(150) NOT NULL,
	descripcion TEXT NOT NULL,
	ubicacion VARCHAR(100),
	fecha_publicacion TIMESTAMPTZ DEFAULT NOW(),
	estado VARCHAR(20) DEFAULT 'abierta',
	imagen_url VARCHAR(255),
	detalles_adicionales TEXT,
	imagen_url_2 VARCHAR(255),
	imagen_url_3 VARCHAR(255),
	imagen_url_4 VARCHAR(255),
	puesto VARCHAR(100),
	salario DECIMAL(10, 2),
	nivel VARCHAR(50),
	horarios VARCHAR(100),
	is_featured BOOLEAN DEFAULT FALSE,
	featured_until TIMESTAMPTZ,
	titulo_es VARCHAR(150),
	titulo_en VARCHAR(150),
	descripcion_es TEXT,
	descripcion_en TEXT,
	puesto_es VARCHAR(100),
	puesto_en VARCHAR(100),
	ubicacion_es VARCHAR(100),
	ubicacion_en VARCHAR(100),
	horarios_es VARCHAR(100),
	horarios_en VARCHAR(100),
	nivel_es VARCHAR(50),
	nivel_en VARCHAR(50),
	detalles_adicionales_es TEXT,
	detalles_adicionales_en TEXT
);

-- Tabla de perfiles_usuario
CREATE TABLE perfiles_usuario (
	id_usuario INTEGER PRIMARY KEY REFERENCES usuarios (id) ON DELETE CASCADE,
	foto_perfil_url VARCHAR(255),
	telefono VARCHAR(50),
	nacionalidad VARCHAR(100),
	resumen_profesional TEXT,
	cv_url VARCHAR(255),
	posicion_principal VARCHAR(100),
	linkedin_url VARCHAR(255),
	instagram_url VARCHAR(255),
	youtube_url VARCHAR(255),
	transfermarkt_url VARCHAR(255),
	altura_cm INTEGER,
	peso_kg INTEGER,
	pie_dominante VARCHAR(50),
	fecha_de_nacimiento DATE,
	resumen_profesional_es TEXT,
	resumen_profesional_en TEXT,
	posicion_principal_es VARCHAR(100),
	posicion_principal_en VARCHAR(100),
	nacionalidad_es VARCHAR(100),
	nacionalidad_en VARCHAR(100),
	pie_dominante_es VARCHAR(50),
	pie_dominante_en VARCHAR(50)
);

-- Tabla de postulaciones
CREATE TABLE postulaciones (
	id SERIAL PRIMARY KEY,
	id_oferta INTEGER REFERENCES ofertas_laborales (id) ON DELETE CASCADE,
	id_usuario_postulante INTEGER REFERENCES usuarios (id),
	mensaje_presentacion TEXT,
	fecha_postulacion TIMESTAMPTZ DEFAULT NOW(),
	estado VARCHAR(20) DEFAULT 'enviada',
	UNIQUE (id_oferta, id_usuario_postulante)
);

-- Tabla de subscription_plans
CREATE TABLE subscription_plans (
	id SERIAL PRIMARY KEY,
	plan_name VARCHAR(50) NOT NULL UNIQUE,
	price_usd DECIMAL(10, 2) NOT NULL,
	price_mp INTEGER NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla de suscripciones
CREATE TABLE suscripciones (
	id SERIAL PRIMARY KEY,
	id_usuario INTEGER UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
	plan VARCHAR(50),
	fecha_fin TIMESTAMPTZ,
	estado VARCHAR(20),
	id_mp_pago VARCHAR(255),
	id_mp_suscripcion VARCHAR(255),
	id_paypal_pago VARCHAR(255),
	id_paypal_suscripcion VARCHAR(255),
	metodo_pago VARCHAR(50)
);

-- Tabla de user_photos
CREATE TABLE user_photos (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
	url VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	title VARCHAR(255),
	title_es VARCHAR(255),
	title_en VARCHAR(255)
);

-- Tabla de user_videos
CREATE TABLE user_videos (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
	title VARCHAR(255) NOT NULL,
	youtube_url VARCHAR(500) NOT NULL,
	cover_image_url VARCHAR(500),
	position INTEGER NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE (user_id, position)
);

ALTER TABLE ofertas_laborales
ALTER COLUMN salario TYPE DECIMAL(10, 2)
USING salario::DECIMAL(10, 2);
-- --- Índices para mejorar el rendimiento ---

-- Índices en la tabla de usuarios
CREATE INDEX idx_usuarios_tipo_usuario ON usuarios(tipo_usuario);

-- Índices en la tabla de ofertas_laborales
CREATE INDEX idx_ofertas_id_usuario_ofertante ON ofertas_laborales(id_usuario_ofertante);
CREATE INDEX idx_ofertas_estado ON ofertas_laborales(estado);
CREATE INDEX idx_ofertas_is_featured ON ofertas_laborales(is_featured);

-- Índices en la tabla de postulaciones
CREATE INDEX idx_postulaciones_id_oferta ON postulaciones(id_oferta);
CREATE INDEX idx_postulaciones_id_usuario_postulante ON postulaciones(id_usuario_postulante);

-- Índices en tablas de perfiles, fotos y videos (para búsquedas por usuario)
CREATE INDEX idx_user_photos_user_id ON user_photos(user_id);
CREATE INDEX idx_user_videos_user_id ON user_videos(user_id);

select * from usuarios u;
select * from user_videos uv; 

INSERT INTO subscription_plans (plan_name, price_usd, price_mp) VALUES ('monthly', 2.00, 2000.00);
INSERT INTO subscription_plans (plan_name, price_usd, price_mp) VALUES ('annual', 12.00, 12000.00);
select * from subscription_plans sp;

ALTER TABLE user_videos
ADD COLUMN title_es VARCHAR(255),
ADD COLUMN title_en VARCHAR(255);