// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import initializeSocket from './socket';

import connectDB from './utils/connectDB';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import artistRoutes from './routes/artist.routes';
import webhookRoutes from './routes/webhook.routes'; // FIX: Added missing import

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });
const port: number = parseInt(process.env.PORT as string, 10) || 8888;

// Webhook Route
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).io = io;
    next();
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/artists', artistRoutes); // 2. Mount the public artist routes

// A simple root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('API is running...');
});

// --- Global Error Handler ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler Caught:", err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred on the server.',
    });
});

const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
        initializeSocket(io);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
