// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express'; // Added NextFunction
import dotenv from 'dotenv';
import connectDB from './utils/connectDB';
import authRoutes from './routes/auth.routes'; // Import auth routes

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 8080; // Ensure correct port

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies (optional, but good to have)
app.use(express.urlencoded({ extended: true }));


// --- API Routes ---
// Mount the authentication routes
app.use('/api/auth', authRoutes); // All routes in auth.routes.ts will be prefixed with /api/auth

// A simple root route (can be removed or changed later)
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello, World! Server is running with MongoDB and Auth setup.');
});

// --- Global Error Handler (Basic Example) ---
// This should be defined AFTER all other app.use() and routes calls
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler Caught:", err.stack);
    // Check for specific Mongoose validation errors or other known error types
    // For now, a generic response:
    res.status(500).json({
        message: 'An unexpected error occurred.',
        // In development, you might want to send the error message or stack
        // error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Auth routes available at /api/auth`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();