// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService, IRegisterClientData, IRegisterArtistData, ILoginData } from '../services/auth.service';

const authService = new AuthService();

// --- Controller for Client Registration ---
export const registerClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            res.status(400).json({ message: 'All fields are required for client registration.' });
            return;
        }
        const clientData: IRegisterClientData = { email, password_to_hash: password, firstName, lastName, phoneNumber };
        const newClient = await authService.registerClient(clientData);
        res.status(201).json({ message: 'Client registered successfully.', user: newClient });

    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            res.status(409).json({ message: 'An account with this email already exists.' });
            return;
        }
        next(error);
    }
};

// --- Controller for Artist Registration ---
export const registerArtist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, firstName, lastName, phoneNumber, experienceYears } = req.body;
        if (!email || !password || !firstName || !lastName || !phoneNumber || experienceYears === undefined) {
            res.status(400).json({ message: 'All fields, including experience years, are required for artist registration.' });
            return;
        }
        const artistData: IRegisterArtistData = { email, password_to_hash: password, firstName, lastName, phoneNumber, experienceYears };
        const newArtist = await authService.registerArtist(artistData);
        res.status(201).json({ message: 'Artist registration submitted successfully. Awaiting admin approval.', user: newArtist });

    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            res.status(409).json({ message: 'An account with this email already exists.' });
            return;
        }
        next(error);
    }
};

// --- Controller for Login (Unchanged) ---
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }
        const loginData: ILoginData = { email, password_from_user: password };
        const loginResponse = await authService.loginUser(loginData);
        res.status(200).json(loginResponse);

    } catch (error: any) {
        // Handle specific login errors from the service
        if (error.message.includes('Invalid credentials') || error.message.includes('deactivated') || error.message.includes('not yet approved')) {
            res.status(401).json({ message: error.message });
            return;
        }
        next(error);
    }
};
