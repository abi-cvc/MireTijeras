-- Tabla de franjas horarias disponibles
CREATE TABLE IF NOT EXISTS franjas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT TRUE
);

-- Tabla de citas agendadas
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    servicio VARCHAR(100) NOT NULL,
    franja_id INTEGER REFERENCES franjas(id) ON DELETE SET NULL
);
