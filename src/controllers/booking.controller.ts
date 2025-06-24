import { Request, Response } from 'express';
import Booking from '../models/Booking.model';
import Service, { IService } from '../models/Service.model';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const { artistId, serviceId, location, bookingTime, notes } = req.body;
    const clientId = req.user!._id;

    if (!artistId || !serviceId || !location || !bookingTime) {
        res.status(400).json({ message: 'Artist, service, location, and booking time are required.' });
        return;
    }

    const service: IService | null = await Service.findById(serviceId);
    if (!service) {
        res.status(404).json({ message: 'Service not found.' });
        return;
    }

    const totalAmount = service.price;
    const depositAmount = Math.round(totalAmount * 0.20);

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
        amount: depositAmount,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
        },
        metadata: {
            serviceId: (service._id as mongoose.Types.ObjectId).toString(),
            clientId: (clientId as mongoose.Types.ObjectId).toString(),
            artistId: artistId.toString(),
        },
    });

    // Create the booking in our database
    const newBooking = await Booking.create({
        client: clientId,
        artist: artistId,
        service: serviceId,
        location,
        bookingTime,
        depositAmount,
        totalAmount,
        notes,
        stripePaymentIntentId: paymentIntent.id,
    });

    req.io?.to(artistId.toString()).emit('new_booking_request', {
        message: `You have a new booking request from ${req.user!.firstName}`,
        booking: newBooking
    });

    res.status(201).json({
        message: 'Booking request created. Please complete the deposit payment.',
        booking: newBooking,
        paymentIntentClientSecret: paymentIntent.client_secret
    });
};


export const getMyBookings = async (req: Request, res: Response): Promise<void> => { /* ... */ };
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => { /* ... */ };
export const cancelBooking = async (req: Request, res: Response): Promise<void> => { /* ... */ };
