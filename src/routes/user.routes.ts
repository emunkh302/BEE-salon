// src/routes/user.routes.ts
import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth.middleware'; // Import our middleware
import { UserRole } from '../config/roles';

const router = Router();

// A simple controller function to get the current user's profile
const getMyProfile = (req: Request, res: Response) => {
    // The 'req.user' object is attached by the 'protect' middleware
    res.status(200).json({ user: req.user });
};

// Example of an admin-only route
const getAdminData = (req: Request, res: Response) => {
    res.status(200).json({ message: "Welcome, Admin! Here is your secret data." });
};

// --- Define Routes ---

// @desc    Get current logged-in user's profile
// @route   GET /api/users/me
// @access  Private
// To access this route, a user must be logged in (i.e., provide a valid JWT).
router.get('/me', protect, getMyProfile);


// @desc    Get admin-only data
// @route   GET /api/users/admin-data
// @access  Private (Admin only)
// To access this route, a user must be logged in AND have the 'admin' role.
router.get('/admin-data', protect, authorize(UserRole.ADMIN), getAdminData);


export default router;
