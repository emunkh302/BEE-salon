import { Request, Response, NextFunction } from 'express';
import { AuthService, IRegisterClientData, IRegisterArtistData, ILoginData } from '../services/auth.service';

const authService = new AuthService();

// --- Controller for Client Registration ---
export const registerClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // FIX: Add a check to ensure req.body exists before destructuring
        if (!req.body) {
            res.status(400).json({ message: 'Missing form data.' });
            return;
        }
        const { email, password, firstName, lastName, phoneNumber } = req.body;
        
        const profileImagePath = req.file ? req.file.path : undefined;

        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            res.status(400).json({ message: 'All required text fields must be provided.' });
            return;
        }
        
        const clientData: IRegisterClientData = { 
            email, 
            password_to_hash: password, 
            firstName, 
            lastName, 
            phoneNumber,
            profileImage: profileImagePath
        };
        
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
        // FIX: Add a check to ensure req.body exists
        if (!req.body) {
            res.status(400).json({ message: 'Missing form data.' });
            return;
        }
        const { email, password, firstName, lastName, phoneNumber, userName, experienceYears } = req.body;
        
        const profileImagePath = req.file ? req.file.path : undefined;

        if (!email || !password || !firstName || !lastName || !phoneNumber || !userName || experienceYears === undefined) {
            res.status(400).json({ message: 'All required text fields must be provided.' });
            return;
        }
        
        const artistData: IRegisterArtistData = { 
            email, 
            password_to_hash: password, 
            firstName, 
            lastName, 
            phoneNumber, 
            userName, 
            experienceYears,
            profileImage: profileImagePath
        };
        
        const newArtist = await authService.registerArtist(artistData);
        res.status(201).json({ message: 'Artist registration submitted successfully. Awaiting admin approval.', user: newArtist });

    } catch (error: any) {
        const field = Object.keys(error.keyValue || {})[0];
        if (error.name === 'MongoServerError' && error.code === 11000) {
            res.status(409).json({ message: `An account with this ${field} already exists.` });
            return;
        }
        next(error);
    }
};

// --- Login Controller (Unchanged) ---
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