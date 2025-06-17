// src/models/Booking.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum BookingStatus {
    PENDING = 'Pending',       // Client has requested, awaiting artist confirmation
    CONFIRMED = 'Confirmed',   // Artist has confirmed the booking
    COMPLETED = 'Completed',   // The service has been rendered
    CANCELLED = 'Cancelled',   // The booking was cancelled by either party
    // This could also include a 'Declined' status if an artist rejects a request
}

// Interface for storing location data
interface ILocation {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    // Geolocation coordinates (optional but recommended for maps)
    lat?: number;
    lng?: number;
}

export interface IBooking extends Document {
    client: mongoose.Types.ObjectId;
    artist: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    location: ILocation;
    bookingTime: Date;
    status: BookingStatus;
    depositAmount: number; // Stored in cents
    totalAmount: number;   // Stored in cents
    notes?: string;        // Optional notes from the client
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema({
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
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    location: {
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        zipCode: { type: String, required: true, trim: true },
        lat: { type: Number },
        lng: { type: Number },
    },
    bookingTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.PENDING,
    },
    depositAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true
});

// Index to help artists and clients quickly find their bookings
BookingSchema.index({ artist: 1, bookingTime: -1 });
BookingSchema.index({ client: 1, bookingTime: -1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
