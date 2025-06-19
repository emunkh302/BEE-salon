// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import Booking, { BookingStatus } from '../models/Booking.model';
import Service from '../models/Service.model';
import { UserRole } from '../config/roles';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Client
export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { artistId, serviceId, location, bookingTime, notes } = req.body;
        const clientId = req.user?._id;

        if (!artistId || !serviceId || !location || !bookingTime) {
            res.status(400).json({ message: 'Artist, service, location, and booking time are required.' });
            return;
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        const depositAmount = service.price * 0.20;
        const totalAmount = service.price;

        const newBooking = await Booking.create({
            client: clientId,
            artist: artistId,
            service: serviceId,
            location,
            bookingTime,
            depositAmount,
            totalAmount,
            notes,
        });

        res.status(201).json({
            message: 'Booking request sent successfully. Awaiting artist confirmation.',
            data: newBooking
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get bookings for the logged-in user (client or artist)
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?._id;
        const userRole = req.user?.role;

        let query = {};
        if (userRole === UserRole.CLIENT) {
            query = { client: userId };
        } else if (userRole === UserRole.ARTIST) {
            query = { artist: userId };
        }

        const bookings = await Booking.find(query)
            .populate('client', 'firstName lastName')
            .populate('artist', 'firstName lastName')
            .populate('service', 'name category price duration')
            .sort({ bookingTime: 'desc' });

        res.status(200).json({
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a booking status (by Artist)
// @route   PUT /api/bookings/:id/status
// @access  Private/Artist
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body; // Expecting { "status": "Confirmed" } or { "status": "Cancelled" }
        const bookingId = req.params.id;
        const artistId = req.user?._id;

        // Find the booking by its ID
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        // Ensure the logged-in user is the artist assigned to this booking
        if (booking.artist.toString() !== artistId?.toString()) {
            res.status(403).json({ message: 'You are not authorized to update this booking.' });
            return;
        }
        
        // Artists can only confirm or cancel. Completing a booking might be another endpoint.
        const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.CANCELLED];
        if (!status || !allowedStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid status. Artists can only set status to: ${allowedStatuses.join(', ')}` });
            return;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status: status }, 
            { new: true, runValidators: true }
        );

        // Here you would also trigger a real-time notification to the client
        // req.io.emit('booking_update', { ... });

        res.status(200).json({
            message: `Booking successfully updated to ${status}.`,
            data: updatedBooking
        });

    } catch (error) {
        next(error);
    }
};
