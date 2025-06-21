// src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking.model';
import Service, { IService } from '../models/Service.model';
import { UserRole } from '../config/roles';
import Stripe from 'stripe'; // 1. Import Stripe
import mongoose from 'mongoose';

// 2. Initialize Stripe with your secret key
// FIX: Removing the apiVersion to resolve the specific type error.
// The library will default to a recent, stable version.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// @desc    Create a new booking and a payment intent for the deposit
// @route   POST /api/bookings
// @access  Private/Client
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const { artistId, serviceId, location, bookingTime, notes } = req.body;
    const clientId = req.user!._id;

    if (!artistId || !serviceId || !location || !bookingTime) {
        res.status(400).json({ message: 'Artist, service, location, and booking time are required.' });
        return;
    }

    // Explicitly type the result of the query
    const service: IService | null = await Service.findById(serviceId);
    if (!service) {
        res.status(404).json({ message: 'Service not found.' });
        return;
    }

    // --- Payment Logic ---
    const totalAmount = service.price; // Price is in cents
    const depositAmount = Math.round(totalAmount * 0.20); // Calculate 20% deposit

    // 3. Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: depositAmount,
        currency: 'usd',
        metadata: {
            // FIX: Add type assertions to resolve 'unknown' type errors.
            serviceId: (service._id as mongoose.Types.ObjectId).toString(),
            clientId: (clientId as mongoose.Types.ObjectId).toString(),
            artistId: artistId.toString(),
        },
    });
    // --------------------

    // 4. Create the booking in our database, saving the Stripe PaymentIntent ID
    const newBooking = await Booking.create({
        client: clientId,
        artist: artistId,
        service: serviceId,
        location,
        bookingTime,
        depositAmount,
        totalAmount,
        notes,
        stripePaymentIntentId: paymentIntent.id, // Save the Stripe ID
    });

    // Emit a real-time notification to the artist
    req.io?.to(artistId.toString()).emit('new_booking_request', {
        message: `You have a new booking request from ${req.user!.firstName}`,
        booking: newBooking
    });

    // 5. Send the client_secret back to the frontend
    // The frontend will use this to finalize the payment with Stripe.
    res.status(201).json({
        message: 'Booking request created. Please complete the deposit payment.',
        booking: newBooking,
        paymentIntentClientSecret: paymentIntent.client_secret
    });
};


// Other controller functions (getMyBookings, updateBookingStatus, cancelBooking) remain the same...

export const getMyBookings = async (req: Request, res: Response): Promise<void> => { /* ... no change ... */ };
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => { /* ... no change ... */ };
export const cancelBooking = async (req: Request, res: Response): Promise<void> => { /* ... no change ... */ };
