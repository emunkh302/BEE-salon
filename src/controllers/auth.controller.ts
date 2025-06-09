// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService, IRegisterData } from '../services/auth.service';
import { UserRole } from '../config/roles';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('[AUTH CONTROLLER] Register request received at:', new Date().toLocaleTimeString());
    
    try {
        console.log('[AUTH CONTROLLER] Entering TRY block.');
        const {
            email,
            password,
            firstName,
            lastName,
            userName,
            role,
            companyName,
            phoneNumber,
        } = req.body;

        console.log('[AUTH CONTROLLER] Request body parsed:', { email, userName });

        if (!email || !password || !firstName || !lastName || !userName) {
            console.log('[AUTH CONTROLLER] Validation failed: Missing required fields.');
            res.status(400).json({ message: 'Email, password, firstName, lastName, and userName are required.' });
            return;
        }
        
        if (role && !Object.values(UserRole).includes(role as UserRole)) {
            console.log('[AUTH CONTROLLER] Validation failed: Invalid role.');
            res.status(400).json({ message: `Invalid role provided. Supported roles are: ${Object.values(UserRole).join(', ')}` });
            return;
        }

        console.log('[AUTH CONTROLLER] Validation passed. Preparing user data.');
        const userData: IRegisterData = {
            email,
            password_to_hash: password,
            firstName,
            lastName,
            userName,
            role: role as UserRole,
            companyName,
            phoneNumber,
        };

        console.log('[AUTH CONTROLLER] Calling authService.registerUser...');
        const registeredUser = await authService.registerUser(userData);
        console.log('[AUTH CONTROLLER] authService.registerUser successfully returned.');

        // If we get here, the user was created successfully. Send 201.
        console.log('[AUTH CONTROLLER] Sending 201 success response.');
        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: registeredUser._id,
                email: registeredUser.email,
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName,
                userName: registeredUser.userName,
                role: registeredUser.role,
            }
        });
        console.log('[AUTH CONTROLLER] Success response sent.');

    } catch (error: any) {
        console.error('[AUTH CONTROLLER] Entering CATCH block. Error:', error);

        if (error.name === 'MongoServerError' && error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            console.log(`[AUTH CONTROLLER] Sending 409 duplicate key error for field: ${field}`);
            res.status(409).json({ message: `An account with that ${field} already exists.` });
            return;
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            console.log('[AUTH CONTROLLER] Sending 400 validation error.');
            res.status(400).json({ message: 'Validation failed', errors: messages });
            return;
        }

        console.log('[AUTH CONTROLLER] Passing error to global error handler via next(error).');
        next(error);
    }
};
