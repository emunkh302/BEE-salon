// src/types/express/index.d.ts

// Import the User interface from your model
import { IUser } from '../../models/User.model';

// Use declaration merging to add a 'user' property to the Express Request interface
declare global {
  namespace Express {
    export interface Request {
      user?: IUser; // The user property will be optional and of type IUser
    }
  }
}
