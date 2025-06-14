// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService, IRegisterClientData, IRegisterArtistData, ILoginData } from '../services/auth.service';

const authService = new AuthService();

// This controller is working correctly.
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
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ message: `An account with this ${field} already exists.` });
            return;
        }
        next(error);
    }
};

// --- Controller for Artist Registration ---
// This is the controller that needs careful review.
export const registerArtist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Ensure 'userName' is being correctly extracted from the request body.
        const { email, password, firstName, lastName, phoneNumber, userName, experienceYears } = req.body;

        // 2. Add 'userName' to the validation check. This is a critical step.
        if (!email || !password || !firstName || !lastName || !phoneNumber || !userName || experienceYears === undefined) {
            res.status(400).json({ message: 'All fields, including userName and experience years, are required for artist registration.' });
            return;
        }
        
        // 3. Ensure 'userName' is included when passing data to the service.
        const artistData: IRegisterArtistData = { email, password_to_hash: password, firstName, lastName, phoneNumber, userName, experienceYears };
        const newArtist = await authService.registerArtist(artistData);
        
        res.status(201).json({ message: 'Artist registration submitted successfully. Awaiting admin approval.', user: newArtist });

    } catch (error: any) {
        if (error.name === 'MongoServerError' && error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ message: `An account with this ${field} already exists.` });
            return;
        }
        next(error);
    }
};


// Login controller
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
        if (error.message.includes('Invalid credentials') || error.message.includes('deactivated') || error.message.includes('not yet approved')) {
            res.status(401).json({ message: error.message });
            return;
        }
        next(error);
    }
};
