// src/services/auth.service.ts
import User, { IUser } from '../models/User.model';
import { UserRole } from '../config/roles';
import mongoose from 'mongoose'; // Import mongoose for type usage

export interface IRegisterData {
    email: string;
    password_to_hash: string;
    firstName: string;
    lastName: string;
    userName:string;
    role?: UserRole;
    companyName?: string;
    phoneNumber?: string;
}

export type RegisteredUserResponse = Omit<IUser, 'passwordHash' | '__v'> & { _id: mongoose.Types.ObjectId };

export class AuthService {
    public async registerUser(userData: IRegisterData): Promise<RegisteredUserResponse> {
        const { email, userName, password_to_hash, ...otherData } = userData;

        // REMOVED: The manual checks for existing users.
        // We will now rely on the database's unique index to enforce uniqueness.
        // This is a more robust pattern that prevents race conditions.

        // Create a new user instance. The pre-save hook will hash the password.
        const newUser = new User({
            email: email.toLowerCase(),
            userName: userName.toLowerCase(),
            passwordHash: password_to_hash,
            ...otherData,
        });

        // Attempt to save the user. If the email or username is a duplicate,
        // Mongoose will throw a MongoServerError with code 11000, which our
        // controller's catch block is already designed to handle.
        await newUser.save();

        // If save() is successful, sanitize the response object as before.
        const userObject = newUser.toObject();

        // Create a new object excluding passwordHash and __v (Mongoose version key)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, __v, ...safeUserObject } = userObject;

        return safeUserObject as RegisteredUserResponse;
    }
}
