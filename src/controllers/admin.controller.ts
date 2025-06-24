import { Request, Response, NextFunction } from 'express';
import ArtistProfile, { ArtistStatus } from '../models/ArtistProfile.model';
import User from '../models/User.model';

// @desc    Get all artist profiles with a 'pending' status
// @route   GET /api/admin/artists/pending
// @access  Private/Admin
export const getPendingArtists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Find all artist profiles with status 'pending'
        // We use .populate() to fetch the associated user's details (name, email, etc.)
        const pendingArtists = await ArtistProfile.find({ status: ArtistStatus.PENDING })
            .populate({
                path: 'user',
                model: User,
                select: 'firstName lastName email phoneNumber' // Select which user fields to return
            });

        res.status(200).json({
            count: pendingArtists.length,
            data: pendingArtists
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve or reject an artist's application
// @route   PUT /api/admin/artists/:id/status
// @access  Private/Admin
export const updateArtistStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body; // Expecting { "status": "approved" } or { "status": "rejected" }
        const artistProfileId = req.params.id;

        // Validate the incoming status
        if (!status || ![ArtistStatus.APPROVED, ArtistStatus.REJECTED].includes(status)) {
            res.status(400).json({ message: "Invalid status provided. Must be 'approved' or 'rejected'." });
            return;
        }

        // Find the artist profile by its own _id and update it
        const updatedArtistProfile = await ArtistProfile.findByIdAndUpdate(
            artistProfileId,
            { status: status },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedArtistProfile) {
            res.status(404).json({ message: `Artist profile with ID ${artistProfileId} not found.` });
            return;
        }

        res.status(200).json({
            message: `Artist status successfully updated to '${status}'.`,
            data: updatedArtistProfile
        });

    } catch (error) {
        next(error);
    }
};
