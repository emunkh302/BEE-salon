// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/connectDB';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'; // Import the new user routes

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 8888; // Using port 8888

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Mount the user routes


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
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
