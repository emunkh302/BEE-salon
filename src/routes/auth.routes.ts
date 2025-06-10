// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerClient, registerArtist, login } from '../controllers/auth.controller';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// --- New Registration Routes ---
// Register a new Client
router.post('/register/client', asyncHandler(registerClient));

// Register a new Artist
router.post('/register/artist', asyncHandler(registerArtist));

// --- Login Route (Unchanged) ---
router.post('/login', asyncHandler(login));

export default router;
