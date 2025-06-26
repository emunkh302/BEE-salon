// src/routes/service.routes.ts
import { Router } from 'express';
import { createService, getArtistServices, updateService, deleteService } from '../controllers/service.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Define Service Management Routes ---

// UPDATED: Creating, updating, and deleting services now requires ADMIN role
router.post('/', protect, authorize(UserRole.ADMIN), asyncHandler(createService));
router.put('/:id', protect, authorize(UserRole.ADMIN), asyncHandler(updateService));
router.delete('/:id', protect, authorize(UserRole.ADMIN), asyncHandler(deleteService));

// NEW: Public route to get all services for a specific artist
router.get('/artist/:artistId', asyncHandler(getArtistServices));


export default router;
