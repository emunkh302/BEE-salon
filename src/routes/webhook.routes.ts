// src/routes/webhook.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { stripeWebhookHandler } from '../controllers/webhook.controller';

const router = Router();

// A simple async handler wrapper to catch errors in async controllers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// This route will be called by Stripe
router.post('/', asyncHandler(stripeWebhookHandler));

export default router;
