import { applicationsService } from '../services/applications.service.js';
import {
  validateCreateApplication,
  validateUpdateApplicationStatus,
  ValidationError,
} from '../validators/applications.validator.js';

import { BusinessError } from '../services/applications.service.js';

const sendError = (res, err, fallbackStatus = 500) => {
  const status = err.statusCode || fallbackStatus;
  return res.status(status).json({ error: err.message || 'Error interno del servidor.' });
};

export const applicationsController = {
  /**
   * POST /applications
   */
  async create(req, res) {
    try {
      validateCreateApplication(req.body);
      const result = await applicationsService.createApplication(req.body);
      return res.status(201).json(result);
    } catch (err) {
      if (err instanceof ValidationError || err instanceof BusinessError) {
        return sendError(res, err);
      }
      console.error('[createApplication]', err);
      return sendError(res, err, 500);
    }
  },

  /**
   * GET /applications
   */
  async list(req, res) {
    try {
      const { candidateId, vacancyId, status, priority, source, limit, offset } = req.query;
      const filters = {
        candidateId: candidateId ? Number(candidateId) : undefined,
        vacancyId:   vacancyId   ? Number(vacancyId)   : undefined,
        status,
        priority,
        source,
        limit: limit ? Number(limit) : 50,
        offset: offset ? Number(offset) : 0,
      };
      const data = await applicationsService.listApplications(filters);
      return res.status(200).json(data);
    } catch (err) {
      console.error('[listApplications]', err);
      return sendError(res, err, 500);
    }
  },

  /**
   * GET /applications/:id
   */
  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'id inválido.' });
      }
      const data = await applicationsService.getApplicationById(id);
      return res.status(200).json(data);
    } catch (err) {
      if (err instanceof BusinessError) return sendError(res, err);
      console.error('[getApplicationById]', err);
      return sendError(res, err, 500);
    }
  },

  /**
   * PATCH /applications/:id/status
   */
  async updateStatus(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'id inválido.' });
      }
      validateUpdateApplicationStatus(req.body);
      const data = await applicationsService.updateApplicationStatus(id, req.body.estado);
      return res.status(200).json(data);
    } catch (err) {
      if (err instanceof ValidationError || err instanceof BusinessError) {
        return sendError(res, err);
      }
      console.error('[updateApplicationStatus]', err);
      return sendError(res, err, 500);
    }
  },
};