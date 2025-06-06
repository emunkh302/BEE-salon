// src/routes/auth.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
// Import the original controller function
import { register as originalRegisterController } from '../controllers/auth.controller';

const router = Router();

// Wrapper for the registration controller to ensure correct handler signature
const registerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Call the original controller.
        // If originalRegisterController handles sending the response (res.json, res.send)
        // or calls next(), then its own return value (like Promise<Response>) is fine here.
        // The wrapper's void return satisfies Express's type for RequestHandler.
        await originalRegisterController(req, res, next);
    } catch (error) {
        // If the original controller might throw an error that it doesn't pass to next(),
        // this catch block ensures it's propagated to Express's error handling.
        next(error);
    }
};

// POST /api/auth/register
router.post(
    '/register',
    registerHandler // Use the wrapped handler
);

// We will add login and other auth routes here later
// Example for login (if you create a loginController):
// import { login as originalLoginController } from '../controllers/auth.controller';
// const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         await originalLoginController(req, res, next);
//     } catch (error) {
//         next(error);
//     }
// };
// router.post('/login', loginHandler);

export default router;
