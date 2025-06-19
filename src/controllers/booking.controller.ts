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
            client: clientId, artist: artistId, service: serviceId, location, bookingTime, depositAmount, totalAmount, notes,
        });
        res.status(201).json({ message: 'Booking request sent successfully. Awaiting artist confirmation.', data: newBooking });
    } catch (error) {
        next(error);
    }
};

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
        res.status(200).json({ count: bookings.length, data: bookings });
    } catch (error) {
        next(error);
    }
};


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
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        if (booking.artist.toString() !== artistId?.toString()) {
            res.status(403).json({ message: 'You are not authorized to update this booking.' });
            return;
        }
        
        // UPDATED: Artists can now also mark a booking as 'Completed'
        const allowedStatuses = [BookingStatus.CONFIRMED, BookingStatus.COMPLETED];
        if (!status || !allowedStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid status. Artists can only set status to: ${allowedStatuses.join(' or ')}` });
            return;
        }
        
        // Prevent marking a booking as completed if it wasn't confirmed first
        if (status === BookingStatus.COMPLETED && booking.status !== BookingStatus.CONFIRMED) {
            res.status(400).json({ message: 'Booking must be confirmed before it can be completed.' });
            return;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true, runValidators: true });
        res.status(200).json({ message: `Booking successfully updated to ${status}.`, data: updatedBooking });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel a booking (by Artist or Client)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?._id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        // Check if the current user is either the client or the artist for this booking
        const isClient = booking.client.toString() === userId?.toString();
        const isArtist = booking.artist.toString() === userId?.toString();

        if (!isClient && !isArtist) {
            res.status(403).json({ message: 'You are not authorized to cancel this booking.' });
            return;
        }

        // Prevent cancelling a booking that is already completed or cancelled
        if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
            res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}.` });
            return;
        }

        // Update the status to 'Cancelled'
        booking.status = BookingStatus.CANCELLED;
        await booking.save();

        // In a real app, you would add logic here to handle refunding the deposit
        // For example: await refundDeposit(booking.paymentIntentId);

        res.status(200).json({ message: 'Booking successfully cancelled.', data: booking });

    } catch (error) {
        next(error);
    }
};
