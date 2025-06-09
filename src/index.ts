// src/index.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/connectDB';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 8080;

// --- DIAGNOSTIC MIDDLEWARE ---
// This middleware will log every incoming request
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[SERVER] Request received: ${req.method} ${req.path}`);
    next(); // Pass control to the next middleware
});

// --- CORE MIDDLEWARE ---
console.log('[SERVER] Setting up core middleware...');
app.use(express.json());
console.log('[SERVER] express.json() middleware loaded.');

app.use(express.urlencoded({ extended: true }));
console.log('[SERVER] express.urlencoded() middleware loaded.');

// --- API ROUTES ---
console.log('[SERVER] Setting up API routes...');
app.use('/api/auth', authRoutes);
console.log('[SERVER] /api/auth routes mounted.');


// A simple root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello, World! Server is running with MongoDB and Auth setup.');
});

// --- GLOBAL ERROR HANDLER ---
console.log('[SERVER] Setting up global error handler.');
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("[SERVER] Global Error Handler Caught:", err.stack);
    res.status(500).json({
        message: 'An unexpected error occurred on the server.',
    });
});


const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`[SERVER] Setup complete. Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("[SERVER] Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

