// src/models/Review.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    booking: mongoose.Types.ObjectId;
    client: mongoose.Types.ObjectId;
    artist: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true, // A booking can only be reviewed once
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'A rating between 1 and 5 is required.'],
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000,
    }
}, {
    timestamps: true
});

// Index to help artists quickly find all their reviews
ReviewSchema.index({ artist: 1, createdAt: -1 });

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
