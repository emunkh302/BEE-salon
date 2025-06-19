// src/routes/review.routes.ts
import { Router } from 'express';
import { createReview, getArtistReviews } from '../controllers/review.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Define Review Routes ---

// Route for a client to create a new review.
// This is protected and requires the CLIENT role.
router.post('/', protect, authorize(UserRole.CLIENT), asyncHandler(createReview));

// Route to get all reviews for a specific artist.
// This is a public route, anyone can view an artist's reviews.
router.get('/artist/:artistId', asyncHandler(getArtistReviews));

export default router;
