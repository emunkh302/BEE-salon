// src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../config/roles';

// Interface to define the structure of a User document (for TypeScript)
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    userName: string;
    companyName?: string;
    phoneNumber?: string;
    userProfileImage?: string;
    bio?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true, // This creates the unique index for email
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'Email address is invalid.']
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required.'],
            select: false,
            minlength: [8, 'Password must be at least 8 characters long.']
        },
        role: {
            type: String,
            enum: {
                values: Object.values(UserRole),
                message: '{VALUE} is not a supported role.'
            },
            required: [true, 'User role is required.'],
            default: UserRole.CONTRACTOR,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required.'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required.'],
            trim: true,
        },
        userName: {
            type: String,
            required: [true, 'Username is required.'],
            unique: true, // This creates the unique index for userName
            trim: true,
            lowercase: true,
            minlength: [3, 'Username must be at least 3 characters long.'],
        },
        companyName: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        userProfileImage: {
            type: String,
            default: 'https://placehold.co/400x400/000000/FFFFFF?text=User',
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [500, 'Bio cannot exceed 500 characters.'],
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

// --- Mongoose Hooks ---
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
});

// --- Mongoose Methods ---
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Indexing for frequently queried fields
// UserSchema.index({ email: 1 }); // Removed, as unique:true on email field handles this
// UserSchema.index({ userName: 1 }); // Removed, as unique:true on userName field handles this
UserSchema.index({ role: 1 }); // This index is for non-unique queries on role

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
