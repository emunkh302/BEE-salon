// src/services/auth.service.ts
import User, { IUser } from '../models/User.model';
import { UserRole } from '../config/roles';
import mongoose from 'mongoose';

export interface IRegisterData {
    email: string;
    password_to_hash: string;
    firstName: string;
    lastName: string;
    userName: string;
    role?: UserRole;
    companyName?: string;
    phoneNumber?: string;
}

// Define a type for the user object returned by the registration service
// This type explicitly omits 'passwordHash' and Mongoose's '__v' version key
export type RegisteredUserResponse = Omit<IUser, 'passwordHash' | '__v'> & { _id: mongoose.Types.ObjectId };


export class AuthService {
    public async registerUser(userData: IRegisterData): Promise<RegisteredUserResponse> {
        const { email, userName, password_to_hash, ...otherData } = userData;

        const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingUserByEmail) {
            throw new Error('User with this email already exists.');
        }

        const existingUserByUsername = await User.findOne({ userName: userName.toLowerCase() });
        if (existingUserByUsername) {
            throw new Error('Username is already taken.');
        }

        const newUser = new User({
            email: email.toLowerCase(),
            userName: userName.toLowerCase(),
            passwordHash: password_to_hash,
            ...otherData,
        });

        await newUser.save();

        // Convert to plain object
        const userObject = newUser.toObject();

        // Create a new object excluding passwordHash and __v (Mongoose version key)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, __v, ...safeUserObject } = userObject;

        return safeUserObject as RegisteredUserResponse;
    }
}