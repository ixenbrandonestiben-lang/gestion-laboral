import { SOURCES, APPLICATION_STATES } from '../constants/enums.js';

const VALID_SOURCES = Object.values(SOURCES);
const VALID_STATES  = Object.values(APPLICATION_STATES);

export class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Valida el payload para crear una postulación.
 */
export const validateCreateApplication = (body) => {
  const { candidateId, vacancyId, source, coverLetter } = body ?? {};

  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    throw new ValidationError('candidateId debe ser un entero positivo.');
  }
  if (!Number.isInteger(vacancyId) || vacancyId <= 0) {
    throw new ValidationError('vacancyId debe ser un entero positivo.');
  }
  if (!VALID_SOURCES.includes(source)) {
    throw new ValidationError(
      `source inválido. Valores permitidos: ${VALID_SOURCES.join(', ')}.`
    );
  }
  if (coverLetter !== undefined && coverLetter !== null && typeof coverLetter !== 'string') {
    throw new ValidationError('coverLetter debe ser una cadena de texto.');
  }
};

/**
 * Valida el payload para actualizar el estado de una postulación.
 */
export const validateUpdateApplicationStatus = (body) => {
  const { estado } = body ?? {};
  if (!VALID_STATES.includes(estado)) {
    throw new ValidationError(
      `estado inválido. Valores permitidos: ${VALID_STATES.join(', ')}.`
    );
  }
};