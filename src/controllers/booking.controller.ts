// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking.model';
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

        // Fetch the service to get its price for calculating deposit
        const service = await Service.findById(serviceId);
        if (!service) {
            res.status(404).json({ message: 'Service not found.' });
            return;
        }

        // --- Payment Logic (Simplified for now) ---
        // In a real app, you would integrate with Stripe here to process the deposit.
        // For now, we'll just calculate a 20% deposit.
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
