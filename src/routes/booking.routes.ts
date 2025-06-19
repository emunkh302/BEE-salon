// src/routes/booking.routes.ts
import { Router } from 'express';
import { 
    createBooking, 
    getMyBookings, 
    updateBookingStatus, 
    cancelBooking 
} from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper to catch errors in async controllers
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes in this file require the user to be logged in.
router.use(protect);

// --- Define Booking Routes ---

// Route for a client to create a new booking request
// POST /api/bookings
router.post('/', authorize(UserRole.CLIENT), asyncHandler(createBooking));

// Route for either a client or an artist to view their own bookings
// GET /api/bookings/my-bookings
router.get('/my-bookings', asyncHandler(getMyBookings));

// Route for an artist to update a booking's status (e.g., to 'Confirmed' or 'Completed')
// PUT /api/bookings/:id/status
router.put('/:id/status', authorize(UserRole.ARTIST), asyncHandler(updateBookingStatus));

// Route for either the client or the artist to cancel a booking
// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', asyncHandler(cancelBooking));

export default router;
