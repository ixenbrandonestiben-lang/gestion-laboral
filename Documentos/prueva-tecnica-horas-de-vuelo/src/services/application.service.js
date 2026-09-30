import { applicationsRepository } from '../repositories/applications.repository.js';
import { calculateScore, mapPriority } from '../utils/scoring.js';
import { VACANCY_STATES } from '../constants/enums.js';

export class BusinessError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const applicationsService = {
  /**
   * Registra una postulación calculando automáticamente puntaje y prioridad.
   */
  async createApplication({ candidateId, vacancyId, source, coverLetter }) {
    // 1. Validar existencia de candidato
    const candidate = await applicationsRepository.findCandidateById(candidateId);
    if (!candidate) {
      throw new BusinessError(`Candidato con id ${candidateId} no encontrado.`, 404);
    }

    // 2. Validar existencia y estado de vacante
    const vacancy = await applicationsRepository.findVacancyById(vacancyId);
    if (!vacancy) {
      throw new BusinessError(`Vacante con id ${vacancyId} no encontrada.`, 404);
    }
    if (vacancy.estado !== VACANCY_STATES.OPEN) {
      throw new BusinessError(
        `No se puede postular a la vacante "${vacancy.titulo_cargo}" porque está ${vacancy.estado}.`,
        409
      );
    }

    // 3. Evitar postulaciones duplicadas
    const alreadyApplied = await applicationsRepository.existsByCandidateAndVacancy(
      candidateId,
      vacancyId
    );
    if (alreadyApplied) {
      throw new BusinessError(
        'El candidato ya tiene una postulación registrada para esta vacante.',
        409
      );
    }

    // 4. Contar postulaciones ACTIVAS en OTRAS vacantes
    const activeApplications =
      await applicationsRepository.countActiveApplicationsInOtherVacancies(
        candidateId,
        vacancyId
      );

    // 5. Calcular puntaje y prioridad
    const score = calculateScore({
      candidateYears: candidate.anos_experiencia,
      vacancyMinYears: vacancy.anos_minimos_experiencia_requeridos,
      source,
      coverLetter,
      activeApplications,
    });
    const priority = mapPriority(score);

    // 6. Persistir
    const id = await applicationsRepository.create({
      candidato_id: candidateId,
      vacante_id: vacancyId,
      carta_presentacion: coverLetter ?? null,
      fuente: source,
      puntaje: score,
      prioridad: priority,
    });

    return {
      id,
      candidateId,
      vacancyId,
      source,
      coverLetter: coverLetter ?? null,
      score,
      priority,
      status: 'RECEIVED',
    };
  },

  /**
   * Obtiene una postulación por ID.
   */
  async getApplicationById(id) {
    const application = await applicationsRepository.findById(id);
    if (!application) {
      throw new BusinessError(`Postulación con id ${id} no encontrada.`, 404);
    }
    return application;
  },

  /**
   * Lista postulaciones con filtros.
   */
  async listApplications(filters) {
    return applicationsRepository.findAll(filters);
  },

  /**
   * Actualiza el estado de una postulación.
   */
  async updateApplicationStatus(id, status) {
    const affected = await applicationsRepository.updateStatus(id, status);
    if (affected === 0) {
      throw new BusinessError(`Postulación con id ${id} no encontrada.`, 404);
    }
    return applicationsRepository.findById(id);
  },
};