// src/services/auth.service.ts
import User, { IUser } from '../models/User.model';
import { UserRole } from '../config/roles'; // FIX: Import UserRole from the central config file
import ArtistProfile, { ArtistStatus } from '../models/ArtistProfile.model';
import mongoose from 'mongoose';
import jwt, { SignOptions } from 'jsonwebtoken';

// --- Interfaces ---
export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface IRegisterClientData {
    email: string;
    password_to_hash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profileImage?: string;
}

export interface IRegisterArtistData {
    email: string;
    password_to_hash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userName: string;
    experienceYears: number;
    profileImage?: string;
}

export interface ILoginData {
    email: string;
    password_from_user: string;
}

export interface ILoginResponse {
    token: string;
    user: UserResponse;
}

export class AuthService {

    public async registerClient(clientData: IRegisterClientData): Promise<UserResponse> {
        const { email, password_to_hash, profileImage, ...otherData } = clientData;

        // For clients, we will temporarily use their email prefix as the username for uniqueness
        const userName = email.split('@')[0] + Math.floor(100 + Math.random() * 900);

        const newUser = new User({
            ...otherData,
            email: email.toLowerCase(),
            passwordHash: password_to_hash,
            userName: userName.toLowerCase(),
            role: UserRole.CLIENT,
            profileImage: profileImage // Save the image path
        });
        await newUser.save();
        
        return {
            id: (newUser._id as mongoose.Types.ObjectId).toString(),
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
        };
    }

    public async registerArtist(artistData: IRegisterArtistData): Promise<UserResponse> {
        const { email, password_to_hash, firstName, lastName, phoneNumber, userName, experienceYears, profileImage } = artistData;
        
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newUser = new User({
                email: email.toLowerCase(),
                passwordHash: password_to_hash,
                firstName,
                lastName,
                phoneNumber,
                userName: userName.toLowerCase(),
                role: UserRole.ARTIST,
                profileImage: profileImage // Save the image path
            });
            const savedUser = await newUser.save({ session });
            
            const newArtistProfile = new ArtistProfile({
                user: savedUser._id, 
                experienceYears: experienceYears, 
                status: ArtistStatus.PENDING,
            });
            await newArtistProfile.save({ session });
            
            await session.commitTransaction();
            
            return {
                id: (savedUser._id as mongoose.Types.ObjectId).toString(),
                email: savedUser.email,
                role: savedUser.role,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
            };
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // loginUser implementation...
    public async loginUser(loginData: ILoginData): Promise<ILoginResponse> {
        const { email, password_from_user } = loginData;
        const user: IUser | null = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials or account deactivated.');
        }
        if (user.role === UserRole.ARTIST) {
            const artistProfile = await ArtistProfile.findOne({ user: user._id });
            if (!artistProfile || artistProfile.status !== ArtistStatus.APPROVED) {
                 throw new Error('Artist account is not yet approved.');
            }
        }
        const isPasswordCorrect = await user.comparePassword(password_from_user);
        if (!isPasswordCorrect) {
            throw new Error('Invalid credentials or account deactivated.');
        }
        const tokenPayload = { id: (user._id as mongoose.Types.ObjectId).toString(), role: user.role };
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined.');
        
        const signOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '1d' };
        const token = jwt.sign(tokenPayload, secret, signOptions as any);

        return {
            token,
            user: {
                id: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
}