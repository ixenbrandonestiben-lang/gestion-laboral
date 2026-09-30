import pool from '../config/db.js';
import { ACTIVE_STATES } from '../constants/enums.js';

export const applicationsRepository = {
  /**
   * Obtiene un candidato por ID.
   */
  async findCandidateById(id) {
    const [rows] = await pool.query(
      'SELECT id, nombre, correo_electronico, anos_experiencia FROM candidates WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Obtiene una vacante por ID.
   */
  async findVacancyById(id) {
    const [rows] = await pool.query(
      'SELECT id, titulo_cargo, anos_minimos_experiencia_requeridos, estado FROM vacancies WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Verifica si ya existe una postulación del candidato a la vacante.
   */
  async existsByCandidateAndVacancy(candidateId, vacancyId) {
    const [rows] = await pool.query(
      'SELECT 1 FROM applications WHERE candidato_id = ? AND vacante_id = ? LIMIT 1',
      [candidateId, vacancyId]
    );
    return rows.length > 0;
  },

  /**
   * Cuenta las postulaciones ACTIVAS del candidato en OTRAS vacantes.
   */
  async countActiveApplicationsInOtherVacancies(candidateId, excludeVacancyId) {
    const placeholders = ACTIVE_STATES.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
         FROM applications
        WHERE candidato_id = ?
          AND vacante_id <> ?
          AND estado IN (${placeholders})`,
      [candidateId, excludeVacancyId, ...ACTIVE_STATES]
    );
    return Number(rows[0].total);
  },

  /**
   * Inserta una nueva postulación y retorna su ID.
   */
  async create({
    candidato_id,
    vacante_id,
    carta_presentacion,
    fuente,
    puntaje,
    prioridad,
  }) {
    const [result] = await pool.query(
      `INSERT INTO applications
        (candidato_id, vacante_id, carta_presentacion, fuente, puntaje, prioridad, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'RECEIVED')`,
      [candidato_id, vacante_id, carta_presentacion ?? null, fuente, puntaje, prioridad]
    );
    return result.insertId;
  },

  /**
   * Obtiene una postulación por ID con datos enriquecidos.
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.id,
              a.candidato_id   AS candidateId,
              c.nombre         AS candidateName,
              a.vacante_id     AS vacancyId,
              v.titulo_cargo   AS vacancyTitle,
              a.carta_presentacion AS coverLetter,
              a.fuente         AS source,
              a.puntaje        AS score,
              a.prioridad      AS priority,
              a.estado         AS status,
              a.fecha_creacion       AS createdAt,
              a.fecha_ultima_actualizacion AS updatedAt
         FROM applications a
         JOIN candidates c ON c.id = a.candidato_id
         JOIN vacancies  v ON v.id = a.vacante_id
        WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Lista postulaciones con filtros opcionales.
   */
  async findAll({ candidateId, vacancyId, status, priority, source, limit = 50, offset = 0 }) {
    const conditions = [];
    const params = [];

    if (candidateId) { conditions.push('a.candidato_id = ?'); params.push(candidateId); }
    if (vacancyId)   { conditions.push('a.vacante_id = ?');   params.push(vacancyId); }
    if (status)      { conditions.push('a.estado = ?');       params.push(status); }
    if (priority)    { conditions.push('a.prioridad = ?');    params.push(priority); }
    if (source)      { conditions.push('a.fuente = ?');       params.push(source); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT a.id,
              a.candidato_id   AS candidateId,
              c.nombre         AS candidateName,
              a.vacante_id     AS vacancyId,
              v.titulo_cargo   AS vacancyTitle,
              a.fuente         AS source,
              a.puntaje        AS score,
              a.prioridad      AS priority,
              a.estado         AS status,
              a.fecha_creacion       AS createdAt,
              a.fecha_ultima_actualizacion AS updatedAt
         FROM applications a
         JOIN candidates c ON c.id = a.candidato_id
         JOIN vacancies  v ON v.id = a.vacante_id
         ${where}
        ORDER BY a.puntaje DESC, a.fecha_creacion DESC
        LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    return rows;
  },

  /**
   * Actualiza el estado de una postulación.
   * Retorna el número de filas afectadas.
   */
  async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE applications SET estado = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  },
};