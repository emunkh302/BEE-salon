// src/routes/service.routes.ts
import { Router } from 'express';
import { createService, getMyServices, updateService, deleteService } from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes in this file are protected and require the ARTIST role
router.use(protect, authorize(UserRole.ARTIST));

// --- Define Service Management Routes ---

// Route to get all of the current artist's services
router.get('/my-services', asyncHandler(getMyServices));

// Route for creating a new service
router.post('/', asyncHandler(createService));

// Routes for updating and deleting a specific service by its ID
router.route('/:id')
    .put(asyncHandler(updateService))
    .delete(asyncHandler(deleteService));

export default router;
