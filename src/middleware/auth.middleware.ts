// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';
import { UserRole } from '../config/roles'; // Ensure import is from config

interface JwtPayload {
    id: string;
    role: UserRole;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('Server error: JWT secret is not defined.');
            
            const decoded = jwt.verify(token, secret) as JwtPayload;
            const user = await User.findById(decoded.id).select('-passwordHash');

            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found.' });
                return;
            }
            if (!user.isActive) {
                res.status(403).json({ message: 'User account is deactivated.' });
                return;
            }
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // FIX: Now req.user.role will correctly match the type from UserRole enum
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: `User role '${req.user?.role}' is not authorized to access this route.` });
            return;
        }
        next();
    };
};
