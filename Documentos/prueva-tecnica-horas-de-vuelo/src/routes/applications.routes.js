import { Router } from 'express';
import { applicationsController } from '../controllers/applications.controllers.js';

const router = Router();

router.post('/',            applicationsController.create);
router.get('/',             applicationsController.list);
router.get('/:id',          applicationsController.getById);
router.patch('/:id/status', applicationsController.updateStatus);

export default router;