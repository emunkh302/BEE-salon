// src/models/ArtistProfile.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum ArtistStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface IArtistProfile extends Document {
    user: mongoose.Types.ObjectId; // Reference to the User model
    status: ArtistStatus;
    licenseDocs: string[]; // Array of S3 URLs for license documents
    experienceYears: number;
    portfolio: string[]; // Array of S3 URLs for portfolio images
    bio?: string;
    availability: any; // Flexible JSON for schedule (e.g., { "monday": ["9:00", "17:00"], ... })
    createdAt: Date;
    updatedAt: Date;
}

const ArtistProfileSchema: Schema<IArtistProfile> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user can only have one artist profile
    },
    status: {
        type: String,
        enum: Object.values(ArtistStatus),
        default: ArtistStatus.PENDING,
    },
    licenseDocs: [{ type: String }],
    experienceYears: {
        type: Number,
        required: [true, 'Years of experience are required for artists.'],
        min: 0,
    },
    portfolio: [{ type: String }],
    bio: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    availability: {
        type: Schema.Types.Mixed,
        default: {},
    }
}, {
    timestamps: true
});

const ArtistProfile = mongoose.model<IArtistProfile>('ArtistProfile', ArtistProfileSchema);

export default ArtistProfile;
