import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review.model';
import Booking, { BookingStatus } from '../models/Booking.model';
import mongoose from 'mongoose';

// @desc    Create a new review for a completed booking
// @route   POST /api/reviews/
// @access  Private/Client
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { bookingId, rating, comment } = req.body;
        const clientId = req.user?._id;

        if (!bookingId || !rating) {
            res.status(400).json({ message: 'Booking ID and a rating are required.' });
            return;
        }

        // 1. Find the booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found.' });
            return;
        }

        // 2. Verify the user is the client for this booking
        if (booking.client.toString() !== clientId?.toString()) {
            res.status(403).json({ message: 'You are not authorized to review this booking.' });
            return;
        }

        // 3. Verify the booking is completed
        if (booking.status !== BookingStatus.COMPLETED) {
            res.status(400).json({ message: 'You can only review completed bookings.' });
            return;
        }

        // 4. Check if a review for this booking already exists
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            res.status(400).json({ message: 'This booking has already been reviewed.' });
            return;
        }

        // 5. Create and save the new review
        const newReview = await Review.create({
            booking: bookingId,
            client: clientId,
            artist: booking.artist,
            rating,
            comment,
        });

        res.status(201).json({
            message: 'Thank you for your review!',
            data: newReview
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all reviews for a specific artist
// @route   GET /api/reviews/artist/:artistId
// @access  Public
export const getArtistReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const artistId = req.params.artistId;

        const reviews = await Review.find({ artist: artistId })
            .populate('client', 'firstName lastName profileImage') // Show who left the review
            .sort({ createdAt: -1 });

        // Optional: Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const total = reviews.reduce((acc, item) => acc + item.rating, 0);
            averageRating = total / reviews.length;
        }

        res.status(200).json({
            count: reviews.length,
            averageRating: parseFloat(averageRating.toFixed(2)),
            data: reviews
        });
        
    } catch (error) {
        next(error);
    }
};
