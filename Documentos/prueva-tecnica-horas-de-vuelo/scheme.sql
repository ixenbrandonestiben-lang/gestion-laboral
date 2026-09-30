-- ============================================================
-- Esquema de Base de Datos: Gestión de Postulaciones Laborales
-- ============================================================

CREATE DATABASE IF NOT EXISTS job_applications
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE job_applications;

-- ------------------------------------------------------------
-- Tabla: candidates (Candidatos)
-- ------------------------------------------------------------
CREATE TABLE candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL UNIQUE,
  anos_experiencia INT NOT NULL CHECK (anos_experiencia >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: vacancies (Vacantes)
-- ------------------------------------------------------------
CREATE TABLE vacancies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo_cargo VARCHAR(200) NOT NULL,
  anos_minimos_experiencia_requeridos INT NOT NULL CHECK (anos_minimos_experiencia_requeridos >= 0),
  estado ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: applications (Postulaciones)
-- ------------------------------------------------------------
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidato_id INT NOT NULL,
  vacante_id INT NOT NULL,
  carta_presentacion TEXT,
  fuente ENUM('REFERRAL', 'INTERNAL', 'JOB_BOARD', 'OTHER') NOT NULL,
  puntaje INT NOT NULL DEFAULT 0 CHECK (puntaje >= 0),
  prioridad ENUM('LOW', 'MEDIUM', 'HIGH', 'TOP') NOT NULL,
  estado ENUM('RECEIVED', 'IN_REVIEW', 'REJECTED', 'HIRED') NOT NULL DEFAULT 'RECEIVED',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_applications_candidate
    FOREIGN KEY (candidato_id) REFERENCES candidates(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT fk_applications_vacancy
    FOREIGN KEY (vacante_id) REFERENCES vacancies(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Un candidato no puede postular dos veces a la misma vacante
  CONSTRAINT uq_candidate_vacancy
    UNIQUE (candidato_id, vacante_id)
) ENGINE=InnoDB;

-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_applications_estado ON applications(estado);
CREATE INDEX idx_applications_prioridad ON applications(prioridad);
CREATE INDEX idx_applications_vacante ON applications(vacante_id);
CREATE INDEX idx_applications_candidato ON applications(candidato_id);

-- ============================================================
-- Datos de prueba (Seed)
-- ============================================================

-- Candidatos (al menos 3)
INSERT INTO candidates (nombre, correo_electronico, anos_experiencia) VALUES
  ('Ana Martínez',   'ana.martinez@example.com',   5),
  ('Luis Pérez',     'luis.perez@example.com',     2),
  ('Carla Gómez',    'carla.gomez@example.com',    7),
  ('Jorge Ramírez',  'jorge.ramirez@example.com',  1);

-- Vacantes (al menos 2, una CLOSED)
INSERT INTO vacancies (titulo_cargo, anos_minimos_experiencia_requeridos, estado) VALUES
  ('Senior Backend Engineer', 4, 'OPEN'),
  ('Junior Node Developer',   1, 'OPEN'),
  ('Tech Lead',               6, 'CLOSED');