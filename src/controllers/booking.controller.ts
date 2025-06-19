// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import Booking, { BookingStatus } from '../models/Booking.model';
import Service from '../models/Service.model';
import { UserRole } from '../config/roles';

// createBooking and getMyBookings (no changes)
export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { artistId, serviceId, location, bookingTime, notes } = req.body;
        const clientId = req.user?._id;
        if (!artistId || !serviceId || !location || !bookingTime) {
            res.status(400).json({ message: 'Artist, service, location, and booking time are required.' }); return;
        }
        const service = await Service.findById(serviceId);
        if (!service) {
            res.status(404).json({ message: 'Service not found.' }); return;
        }
        const depositAmount = service.price * 0.20;
        const totalAmount = service.price;
        const newBooking = await Booking.create({
            client: clientId, artist: artistId, service: serviceId, location, bookingTime, depositAmount, totalAmount, notes,
        });

        // Emit a notification to the specific artist's room
        if (req.io) {
            req.io.to(artistId.toString()).emit('new_booking_request', {
                message: `You have a new booking request from ${req.user?.firstName}`,
                booking: newBooking
            });
        }

        res.status(201).json({ message: 'Booking request sent successfully.', data: newBooking });
    } catch (error) { next(error); }
};
export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => { /* ... no change ... */ };


// @desc    Update a booking status (by Artist: Confirm or Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private/Artist
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;
        const artistId = req.user?._id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found.' }); return;
        }

        if (booking.artist.toString() !== artistId?.toString()) {
            res.status(403).json({ message: 'You are not authorized to update this booking.' }); return;
        }
        
        const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.COMPLETED];
        if (!status || !allowedStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid status. Artists can only set status to: ${allowedStatuses.join(' or ')}` }); return;
        }
        
        if (status === BookingStatus.COMPLETED && booking.status !== BookingStatus.CONFIRMED) {
            res.status(400).json({ message: 'Booking must be confirmed before it can be completed.' }); return;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true, runValidators: true });
        
        // --- Emit a real-time event to the client ---
        // The 'req.io' object is available thanks to the middleware in index.ts
        if (req.io && updatedBooking) {
            const clientId = updatedBooking.client.toString();
            // Send a message specifically to the client's "room"
            req.io.to(clientId).emit('booking_status_update', {
                message: `Your booking status has been updated to ${status}`,
                booking: updatedBooking
            });
        }
        // ---------------------------------------------

        res.status(200).json({ message: `Booking successfully updated to ${status}.`, data: updatedBooking });
    } catch (error) { next(error); }
};

// cancelBooking (no changes)
export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => { /* ... no change ... */ };
