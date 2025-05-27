// src/index.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/connectDB'; // Import the connectDB function

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT as string, 10) || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// A simple root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello, World! Server is running.');
});

// Function to start the server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

// Call the function to start the server
startServer();