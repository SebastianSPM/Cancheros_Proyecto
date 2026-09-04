DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS canchas_servicios CASCADE;
DROP TABLE IF EXISTS servicios CASCADE;
DROP TABLE IF EXISTS canchas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    foto_perfil TEXT,
    rol VARCHAR(20) DEFAULT 'CLIENTE',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre_cancha VARCHAR(150) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_por_hora NUMERIC(12, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    total_resenas INT DEFAULT 0,
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT TRUE
);

CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    icono VARCHAR(100) NOT NULL
);

CREATE TABLE canchas_servicios (
    cancha_id INT NOT NULL,
    servicio_id INT NOT NULL,
    PRIMARY KEY (cancha_id, servicio_id),
    CONSTRAINT fk_cancha FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE CASCADE,
    CONSTRAINT fk_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
);

CREATE TABLE reservas (
    id BIGINT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    cancha_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    duracion_horas INT NOT NULL,
    precio_hora NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    estado VARCHAR(30) DEFAULT 'Confirmada',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_reserva FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_cancha_reserva FOREIGN KEY (cancha_id) REFERENCES canchas(id) ON DELETE RESTRICT
);

CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Usuarios (1 Admin y 2 Clientes)
INSERT INTO usuarios (id, nombre, apellido, email, telefono, password, foto_perfil, rol) VALUES
(1001, 'Administrador', 'General', 'admin@dominio.com', '3001234567', 'admin123456#', NULL, 'ADMIN'),
(1725300001, 'Sebastian', 'Gomez', 'sebastian.gomez@gmail.com', '3109876543', 'Password123!', NULL, 'CLIENTE'),
(1725300002, 'Cesar', 'Lopez', 'cesar.lopez@gmail.com', '3205551234', 'Secure2026#', NULL, 'CLIENTE');

-- Canchas del sistema
INSERT INTO canchas (id, nombre_cancha, ubicacion, descripcion, precio_por_hora, tipo, rating, total_resenas, imagen_url, disponible) VALUES
(1, 'Cancha la 38', 'Galán, Calle 56 #32', 'Excelente grama sintética con iluminación profesional.', 100000.00, 'Fútbol 5', 4.9, 120, '../assets/images/canchas/cancha11.jpg', TRUE),
(2, 'Cancha El Gol', 'Soledad, Calle 30 #15', 'Ideal para partidos rápidos con amigos.', 80000.00, 'Fútbol 5', 4.7, 85, '../assets/images/canchas/cancha2.jpg', TRUE),
(3, 'Cancha Los Campeones', 'Barranquilla, Calle 72 #40', 'Cancha techada con graderías y cafetería.', 120000.00, 'Fútbol 5', 4.8, 150, '../assets/images/canchas/cancha3.jpg', TRUE),
(5, 'Cancha El Estadio', 'Barranquilla, Carrera 38 #45', 'Cancha amplia para torneos de fútbol 8.', 150000.00, 'Fútbol 8', 5.0, 200, '../assets/images/canchas/cancha5.jpg', TRUE);

-- Ajustar la secuencia de ID de canchas
SELECT setval(pg_get_serial_sequence('canchas', 'id'), (SELECT MAX(id) FROM canchas));

-- Catálogo de Servicios
INSERT INTO servicios (id, nombre, icono) VALUES
(1, 'Camerinos', 'fa-solid fa-person-shelter'),
(2, 'Parqueadero', 'fa-solid fa-square-parking'),
(3, 'Resto-Bar', 'fa-solid fa-mug-hot'),
(4, 'Wi-Fi HighSpeed', 'fa-solid fa-wifi');

SELECT setval(pg_get_serial_sequence('servicios', 'id'), (SELECT MAX(id) FROM servicios));

-- Relación Canchas - Servicios (Muchos a Muchos)
INSERT INTO canchas_servicios (cancha_id, servicio_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2),
(3, 1), (3, 2), (3, 4),
(5, 1), (5, 2), (5, 3), (5, 4);

-- Reservas (Pruebas de relaciones FK)
INSERT INTO reservas (id, usuario_id, cancha_id, fecha, hora_inicio, duracion_horas, precio_hora, total, estado) VALUES
(1725301001, 1725300001, 1, '2026-09-10', '18:00:00', 2, 100000.00, 200000.00, 'Confirmada'),
(1725301002, 1725300002, 3, '2026-09-11', '20:00:00', 1, 120000.00, 120000.00, 'Confirmada'),
(1725301003, 1725300001, 5, '2026-09-12', '19:00:00', 2, 150000.00, 300000.00, 'Confirmada');

-- Mensajes de Contacto
INSERT INTO contactos (nombre, email, telefono, mensaje) VALUES
('Dylan Puentes', 'dylan.pue@gmail.com', '3196405145', 'Buenas tardes, quisiera consultar disponibilidad para un torneo relampago.'),
('Kevin Soto', 'kevinchoso@hotmail.com', '3157778899', 'Hola, me gustaría saber si cuentan con opción de pago de tarjeta.');