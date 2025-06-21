// src/models/Booking.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

// New enum to track the status of the deposit payment
export enum DepositStatus {
    PENDING = 'Pending',   // Awaiting payment from client
    PAID = 'Paid',         // Deposit has been successfully paid
    REFUNDED = 'Refunded', // Deposit has been refunded
}

interface ILocation {
    address: string; city: string; state: string; zipCode: string; lat?: number; lng?: number;
}

export interface IBooking extends Document {
    client: mongoose.Types.ObjectId;
    artist: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    location: ILocation;
    bookingTime: Date;
    status: BookingStatus;
    depositAmount: number;
    totalAmount: number;
    notes?: string;
    // --- New Fields ---
    depositStatus: DepositStatus;
    stripePaymentIntentId?: string; // To store the ID from Stripe
    // ------------------
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema({
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    artist: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    location: {
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true },
        lat: { type: Number },
        lng: { type: Number },
    },
    bookingTime: { type: Date, required: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
    depositAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    // --- New Fields ---
    depositStatus: {
        type: String,
        enum: Object.values(DepositStatus),
        default: DepositStatus.PENDING
    },
    stripePaymentIntentId: {
        type: String,
    }
}, { timestamps: true });

BookingSchema.index({ artist: 1, bookingTime: -1 });
BookingSchema.index({ client: 1, bookingTime: -1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
