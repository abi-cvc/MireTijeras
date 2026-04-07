-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    texto TEXT NOT NULL,
    pineada BOOLEAN DEFAULT FALSE,
    visible BOOLEAN DEFAULT TRUE,
    foto TEXT,
    procedimiento VARCHAR(100),
    edad INTEGER
);
-- Tabla de franjas horarias disponibles
CREATE TABLE IF NOT EXISTS franjas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    servicio VARCHAR(100) NOT NULL,
    franja_id INTEGER REFERENCES franjas(id) ON DELETE SET NULL,
    email VARCHAR(100),
    telefono VARCHAR(30)
);
-- Tabla de sugerencias
CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    texto TEXT NOT NULL,
    estado VARCHAR(30) DEFAULT 'por revisar'
);

-- Tabla de convenios
CREATE TABLE IF NOT EXISTS convenios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    empresa VARCHAR(100) NOT NULL,
    mensaje TEXT,
    estado VARCHAR(30) DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reviews_fecha ON reviews(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(visible);
CREATE INDEX IF NOT EXISTS idx_franjas_fecha ON franjas(fecha);
CREATE INDEX IF NOT EXISTS idx_franjas_disponible ON franjas(disponible);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_franja_id ON citas(franja_id);
