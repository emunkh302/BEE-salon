// src/routes/admin.routes.ts
import { Router } from 'express';
import { getPendingArtists, updateArtistStatus } from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes in this file are protected and require ADMIN role
router.use(protect, authorize(UserRole.ADMIN));

// Define the admin-specific routes
router.get('/artists/pending', asyncHandler(getPendingArtists));
router.put('/artists/:id/status', asyncHandler(updateArtistStatus));

export default router;
