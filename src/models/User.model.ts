// src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../config/roles'; // Import from the central config file

// NOTE: The UserRole enum definition has been removed from this file.

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true, select: false },
        role: { type: String, enum: Object.values(UserRole), required: true },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, required: true, trim: true },
        profileImage: { type: String, default: 'https://placehold.co/400x400/000000/FFFFFF?text=User' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// --- Hooks and Methods (No changes needed) ---
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
