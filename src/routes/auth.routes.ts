// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerClient, registerArtist, login } from '../controllers/auth.controller';
import upload from '../middleware/upload.middleware'; // Import the upload middleware

const router = Router();

const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// UPDATED: Apply the upload middleware to the registration routes.
// 'upload.single("profileImage")' tells multer to expect one file named 'profileImage'.
router.post('/register/client', upload.single('profileImage'), asyncHandler(registerClient));
router.post('/register/artist', upload.single('profileImage'), asyncHandler(registerArtist));

router.post('/login', asyncHandler(login));

export default router;