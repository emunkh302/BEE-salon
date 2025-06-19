// src/routes/booking.routes.ts
import { Router } from 'express';
import { createBooking, getMyBookings, updateBookingStatus } from '../controllers/booking.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/roles';

const router = Router();

// A simple async handler wrapper
const asyncHandler = (fn: (req: any, res: any, next: any) => Promise<any>) => 
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
};

// All routes after this point are protected
router.use(protect);

// A client can create a booking
router.post('/', authorize(UserRole.CLIENT), asyncHandler(createBooking));

// Both clients and artists can view their own bookings
router.get('/my-bookings', asyncHandler(getMyBookings));

// An artist can update the status of a booking
router.put('/:id/status', authorize(UserRole.ARTIST), asyncHandler(updateBookingStatus));


export default router;
