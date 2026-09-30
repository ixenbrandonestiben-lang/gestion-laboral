import { SOURCES, PRIORITIES } from '../constants/enums.js';

/**
 * Palabras clave que otorgan +2 (cuentan una sola vez en conjunto).
 */
const KEYWORDS = ['node', 'sql', 'api'];

/**
 * Evalúa si la carta contiene al menos una de las palabras clave.
 */
const containsKeyword = (coverLetter) => {
  if (!coverLetter) return false;
  const lower = coverLetter.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
};

/**
 * Calcula el puntaje total aplicando las reglas de negocio.
 *
 * @param {Object} params
 * @param {number} params.candidateYears     - Años de experiencia del candidato
 * @param {number} params.vacancyMinYears    - Años mínimos exigidos por la vacante
 * @param {string} params.source             - Fuente de la postulación
 * @param {string} [params.coverLetter]      - Carta de presentación
 * @param {number} params.activeApplications - Postulaciones ACTIVAS en OTRAS vacantes
 * @returns {number} Puntaje (mínimo 0)
 */
export const calculateScore = ({
  candidateYears,
  vacancyMinYears,
  source,
  coverLetter = '',
  activeApplications,
}) => {
  let score = 0;

  if (candidateYears >= vacancyMinYears) score += 4;
  if (source === SOURCES.REFERRAL)        score += 3;
  if (source === SOURCES.INTERNAL)        score += 2;
  if (containsKeyword(coverLetter))       score += 2;
  if (coverLetter && coverLetter.length > 500) score += 1;
  if (activeApplications >= 3)            score -= 2;

  return Math.max(0, score);
};

/**
 * Mapea el puntaje a la prioridad correspondiente.
 */
export const mapPriority = (score) => {
  if (score >= 7) return PRIORITIES.TOP;
  if (score >= 5) return PRIORITIES.HIGH;
  if (score >= 3) return PRIORITIES.MEDIUM;
  return PRIORITIES.LOW;
};