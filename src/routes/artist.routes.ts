// src/routes/artist.routes.ts
import { Router } from 'express';
import { listArtists } from '../controllers/artist.controller';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Define Public Artist Routes ---

// Route to get a list of all approved artists.
// Can be filtered with a query param, e.g., /api/artists?category=Nail
router.get('/', asyncHandler(listArtists));


export default router;
