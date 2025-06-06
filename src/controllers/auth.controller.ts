// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService, IRegisterData, RegisteredUserResponse } from '../services/auth.service';
import { UserRole } from '../config/roles'; // Import UserRole

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            email,
            password, // Assuming 'password' comes from the request body
            firstName,
            lastName,
            userName,
            role, // Role can be optionally provided in the request
            companyName,
            phoneNumber,
        }: IRegisterData & { password?: string } = req.body; // Use password from req.body

        // Basic validation
        if (!email || !password || !firstName || !lastName || !userName) {
            return res.status(400).json({ message: 'Email, password, firstName, lastName, and userName are required.' });
        }
        
        // Validate role if provided
        if (role && !Object.values(UserRole).includes(role as UserRole)) {
            return res.status(400).json({ message: `Invalid role provided. Supported roles are: ${Object.values(UserRole).join(', ')}` });
        }

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
        // Use the more specific return type here
        const registeredUser: RegisteredUserResponse = await authService.registerUser(userData);

        const newUser = await authService.registerUser(userData);

        // On successful registration, you typically wouldn't send back the full user object like this
        // immediately, or at least sanitize it. For now, it's okay.
        // Later, you'd likely send a JWT token.
        return res.status(201).json({
            message: 'User registered successfully.',
            user: { // Construct the response from registeredUser
                id: registeredUser._id,
                email: registeredUser.email,
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName,
                userName: registeredUser.userName,
                role: registeredUser.role,
                // You can add other fields from RegisteredUserResponse as needed
                // companyName: registeredUser.companyName,
                // isActive: registeredUser.isActive,
                // createdAt: registeredUser.createdAt,
                // etc.
            }
        });

    } catch (error: any) { // Catching 'any' for now, better to define error types
        // If error is from Mongoose validation (e.g. unique constraint)
        if (error.name === 'MongoServerError' && error.code === 11000) {
            // Duplicate key error
            // Extract the field that caused the error
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({ message: `An account with that ${field} already exists.` });
        }
        if (error.message.includes('already exists') || error.message.includes('is already taken')) {
             return res.status(409).json({ message: error.message });
        }
        // For other errors, pass to the global error handler (if you have one) or send generic error
        console.error('Registration Error:', error); // Log the actual error for server admins
        // next(error); // If you have a global error handler
        return res.status(500).json({ message: 'An error occurred during registration.' });
    }
};