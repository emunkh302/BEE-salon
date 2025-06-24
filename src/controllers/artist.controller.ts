import { Request, Response, NextFunction } from 'express';
import ArtistProfile, { ArtistStatus } from '../models/ArtistProfile.model';
import mongoose from 'mongoose';

// @desc    Get all approved artists, with optional filtering
// @route   GET /api/artists
// @access  Public
export const listArtists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { category } = req.query; // e.g., ?category=Nail

        // --- Aggregation Pipeline ---
        // This pipeline will find approved artists and enrich their profiles with
        // user details, their services, and an average rating.

        const pipeline: mongoose.PipelineStage[] = [
            // Stage 1: Find only approved artist profiles
            {
                $match: { status: ArtistStatus.APPROVED }
            },
            // Stage 2: Join with the 'users' collection to get the artist's name, email, etc.
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            // Stage 3: Deconstruct the userDetails array
            {
                $unwind: '$userDetails'
            },
            // Stage 4: Join with the 'services' collection to get all services by this artist
            {
                $lookup: {
                    from: 'services',
                    localField: 'user', // Match on the user's ID
                    foreignField: 'artist',
                    as: 'services'
                }
            },
            // Stage 5: (Optional but powerful) Join with 'reviews' to calculate average rating
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'user',
                    foreignField: 'artist',
                    as: 'reviews'
                }
            },
            // Stage 6: Reshape the output document
            {
                $project: {
                    _id: '$userDetails._id', // Use the user's ID as the main ID
                    firstName: '$userDetails.firstName',
                    lastName: '$userDetails.lastName',
                    profileImage: '$userDetails.profileImage',
                    bio: '$bio',
                    experienceYears: '$experienceYears',
                    services: '$services', // Include the full list of services
                    averageRating: { $avg: '$reviews.rating' }, // Calculate the average rating
                    reviewCount: { $size: '$reviews' } // Count the number of reviews
                }
            }
        ];

        // --- Optional Filtering Stage ---
        // If a category is provided in the query string, add another match stage
        if (category && typeof category === 'string') {
            pipeline.push({
                $match: {
                    'services.category': category
                }
            });
        }
        
        const artists = await ArtistProfile.aggregate(pipeline);

        res.status(200).json({
            count: artists.length,
            data: artists
        });

    } catch (error) {
        next(error);
    }
};

// We can add a controller here later to get a single artist's full profile
// export const getArtistById = async (...) => { ... }
