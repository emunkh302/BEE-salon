import mongoose, { Schema, Document } from 'mongoose';

export enum ServiceCategory {
    NAIL = 'Nail',
    LASH = 'Lash',
    MANICURE = 'Manicure',
    PEDICURE = 'Pedicure',
    FACIAL = 'Facial',
    HAIR = 'Hair',
    MAKEUP = 'Makeup',
}

export interface IService extends Document {
    artist: mongoose.Types.ObjectId; // The artist who offers this service
    category: ServiceCategory;
    name: string; // e.g., "Gel Manicure"
    description: string;
    price: number; // Stored in cents to avoid floating point issues
    duration: number; // Duration in minutes
    isActive: boolean; // If the artist is currently offering this service
}

const ServiceSchema: Schema<IService> = new Schema({
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: Object.values(ServiceCategory),
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Service price is required.'],
        min: 0,
    },
    duration: {
        type: Number,
        required: [true, 'Service duration in minutes is required.'],
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});

const Service = mongoose.model<IService>('Service', ServiceSchema);

export default Service;
